"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import { brand } from "@/config/brand";
import {
  buildQuoteMailto,
  currencies,
  DEFAULT_BUDGET,
  DEFAULT_CURRENCY,
  DEFAULT_EVENT_TYPE,
  eventTypeOptions,
  getBudgetOptions,
  type BudgetRangeId,
  type CurrencyCode,
  type QuoteFormData,
} from "@/lib/quote";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-stone-400 focus:border-gold/60 focus:ring-1 focus:ring-gold/30";

const labelClass = "mb-1.5 block text-xs font-semibold tracking-wide text-foreground uppercase";

function FieldGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

function createInitialState(): QuoteFormData {
  return {
    fullName: "",
    email: "",
    phone: "",
    company: "",
    eventType: DEFAULT_EVENT_TYPE,
    eventDate: "",
    guestCount: "",
    currency: DEFAULT_CURRENCY,
    budget: DEFAULT_BUDGET,
    location: "",
    message: "",
  };
}

type QuoteFormProps = {
  variant?: "page" | "drawer";
  onSubmitted?: () => void;
};

export function QuoteForm({ variant = "page", onSubmitted }: QuoteFormProps) {
  const isDrawer = variant === "drawer";
  const [form, setForm] = useState(createInitialState);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const budgetOptions = getBudgetOptions(form.currency ?? DEFAULT_CURRENCY);

  const update = <K extends keyof QuoteFormData>(
    key: K,
    value: QuoteFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Veuillez renseigner votre nom, email et téléphone.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }

    const mailto = buildQuoteMailto({
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company?.trim(),
      location: form.location.trim(),
      message: form.message.trim(),
    });

    window.location.href = mailto;
    setSubmitted(true);
    onSubmitted?.();
  };

  if (submitted) {
    return (
      <div
        className={cn(
          "bg-surface",
          isDrawer ? "p-6 sm:p-8" : "border border-border p-10 sm:p-14"
        )}
      >
        <p className="label-upper text-gold">Demande envoyée</p>
        <h2 className="mt-4 font-display text-3xl font-medium text-foreground">
          Merci pour votre confiance
        </h2>
        <p className="mt-4 max-w-lg text-muted leading-relaxed">
          Votre application mail s&apos;est ouverte avec le récapitulatif de
          votre demande. Envoyez le message pour que l&apos;équipe {brand.name}{" "}
          vous réponde sous 24 heures.
        </p>
        <p className="mt-6 text-sm text-muted">
          Le message n&apos;est pas parti ? Vérifiez que vous avez bien cliqué
          sur « Envoyer » dans votre boîte mail.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:text-gold hover:underline"
        >
          Retour à l&apos;accueil
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "bg-surface",
        isDrawer
          ? "p-5 sm:p-6"
          : "border border-border p-6 sm:p-10 lg:p-12"
      )}
      noValidate
    >
      {!isDrawer && (
        <>
          <p className="label-upper">Formulaire</p>
          <h2 className="mt-4 font-display text-2xl font-medium text-foreground sm:text-3xl">
            Décrivez votre événement
          </h2>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Plus votre brief est précis, plus notre proposition sera adaptée à
            vos attentes.
          </p>
        </>
      )}

      <fieldset className={cn("space-y-8", isDrawer ? "mt-6" : "mt-10")}>
        <legend className="sr-only">Coordonnées</legend>
        <p className="font-display text-lg text-foreground">Vos coordonnées</p>

        <div className="grid gap-6 sm:grid-cols-2">
          <FieldGroup>
            <label htmlFor="fullName" className={labelClass}>
              Nom complet <span className="text-gold">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              className={inputClass}
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Prénom et nom"
            />
          </FieldGroup>

          <FieldGroup>
            <label htmlFor="company" className={labelClass}>
              Société / organisation
            </label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              className={inputClass}
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Optionnel"
            />
          </FieldGroup>

          <FieldGroup>
            <label htmlFor="email" className={labelClass}>
              Email <span className="text-gold">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="vous@exemple.com"
            />
          </FieldGroup>

          <FieldGroup>
            <label htmlFor="phone" className={labelClass}>
              Téléphone <span className="text-gold">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+216 …"
            />
          </FieldGroup>
        </div>
      </fieldset>

      <fieldset className="mt-10 space-y-6 border-t border-border pt-10">
        <legend className="sr-only">Projet</legend>
        <p className="font-display text-lg text-foreground">Votre projet</p>

        <div className="grid gap-6 sm:grid-cols-2">
          <FieldGroup>
            <label htmlFor="eventType" className={labelClass}>
              Type d&apos;événement <span className="text-gold">*</span>
            </label>
            <select
              id="eventType"
              name="eventType"
              required
              className={cn(inputClass, "cursor-pointer")}
              value={form.eventType}
              onChange={(e) =>
                update(
                  "eventType",
                  e.target.value as QuoteFormData["eventType"]
                )
              }
            >
              {eventTypeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup>
            <label htmlFor="eventDate" className={labelClass}>
              Date souhaitée
            </label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              className={inputClass}
              value={form.eventDate}
              onChange={(e) => update("eventDate", e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <label htmlFor="guestCount" className={labelClass}>
              Nombre d&apos;invités
            </label>
            <input
              id="guestCount"
              name="guestCount"
              type="text"
              inputMode="numeric"
              className={inputClass}
              value={form.guestCount}
              onChange={(e) => update("guestCount", e.target.value)}
              placeholder="Ex. 150"
            />
          </FieldGroup>

          <FieldGroup>
            <label htmlFor="currency" className={labelClass}>
              Devise
            </label>
            <select
              id="currency"
              name="currency"
              className={cn(inputClass, "cursor-pointer")}
              value={form.currency}
              onChange={(e) =>
                update("currency", e.target.value as CurrencyCode)
              }
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label} ({c.symbol})
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup>
            <label htmlFor="budget" className={labelClass}>
              Budget estimatif
            </label>
            <select
              id="budget"
              name="budget"
              className={cn(inputClass, "cursor-pointer")}
              value={form.budget}
              onChange={(e) =>
                update("budget", e.target.value as BudgetRangeId)
              }
            >
              {budgetOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup className="sm:col-span-2">
            <label htmlFor="location" className={labelClass}>
              Lieu de l&apos;événement
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className={inputClass}
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Ville, salle, adresse…"
            />
          </FieldGroup>

          <FieldGroup className="sm:col-span-2">
            <label htmlFor="message" className={labelClass}>
              Détails &amp; attentes
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className={cn(inputClass, "resize-y min-h-[8rem]")}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Ambiance souhaitée, services attendus, contraintes particulières…"
            />
          </FieldGroup>
        </div>
      </fieldset>

      {error && (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted">
          En envoyant ce formulaire, vous acceptez d&apos;être recontacté par{" "}
          {brand.name} concernant votre projet.
        </p>
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-gold px-8 py-3.5 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-gold-dark"
        >
          Envoyer ma demande
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
