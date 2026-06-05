"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { QuoteForm } from "@/components/devis/QuoteForm";
import type { QuoteFormData } from "@/lib/quote";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-stone-400 focus:border-gold/60 focus:ring-1 focus:ring-gold/30";

const labelClass =
  "mb-1.5 block text-xs font-semibold tracking-wide text-foreground uppercase";

type QuoteModifyFlowProps = {
  initialReference?: string;
};

export function QuoteModifyFlow({ initialReference = "" }: QuoteModifyFlowProps) {
  const [step, setStep] = useState<"lookup" | "edit">("lookup");
  const [reference, setReference] = useState(initialReference.trim());
  const [verifyEmail, setVerifyEmail] = useState("");
  const [formData, setFormData] = useState<QuoteFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!reference.trim() || !verifyEmail.trim()) {
      setError("Indiquez la référence et l'email utilisés lors de la demande.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quotes/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference.trim(),
          email: verifyEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Demande introuvable.");
        return;
      }

      setReference(data.reference);
      setFormData(data.form);
      setStep("edit");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "edit" && formData) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setStep("lookup")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          Changer de référence
        </button>
        <QuoteForm
          mode="edit"
          initialData={formData}
          quoteReference={reference}
          verifyEmail={verifyEmail}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleLookup}
      className="border border-border bg-surface p-6 sm:p-10 lg:p-12"
      noValidate
    >
      <p className="label-upper">Modification</p>
      <h2 className="mt-4 font-display text-2xl font-medium text-foreground sm:text-3xl">
        Retrouver votre demande
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Saisissez la référence reçue après envoi (ex. DEV-20250605-AB12) et
        l&apos;email utilisé pour accéder au formulaire de modification.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="modify-ref" className={labelClass}>
            Référence <span className="text-gold">*</span>
          </label>
          <input
            id="modify-ref"
            type="text"
            required
            className={cn(inputClass, "uppercase tracking-wide")}
            value={reference}
            onChange={(e) => {
              setReference(e.target.value);
              setError(null);
            }}
            placeholder="DEV-20250605-XXXX"
          />
        </div>
        <div>
          <label htmlFor="modify-email" className={labelClass}>
            Email de la demande <span className="text-gold">*</span>
          </label>
          <input
            id="modify-email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            value={verifyEmail}
            onChange={(e) => {
              setVerifyEmail(e.target.value);
              setError(null);
            }}
            placeholder="vous@exemple.com"
          />
        </div>
      </div>

      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/devis"
          className="text-sm text-muted underline-offset-4 hover:text-gold hover:underline"
        >
          Nouvelle demande de devis
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-gold px-8 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-gold-dark disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Vérification…
            </>
          ) : (
            <>
              Accéder à ma demande
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
