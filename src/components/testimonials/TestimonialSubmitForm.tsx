"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Upload } from "lucide-react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-gold/50";
const labelClass =
  "mb-1.5 block text-xs font-semibold tracking-wide uppercase text-muted";

type Prefill = {
  name: string;
  company: string;
  role: string;
};

type TestimonialSubmitFormProps = {
  token: string;
  prefill: Prefill;
};

export function TestimonialSubmitForm({ token, prefill }: TestimonialSubmitFormProps) {
  const [name, setName] = useState(prefill.name);
  const [role, setRole] = useState(prefill.role);
  const [company, setCompany] = useState(prefill.company);
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("token", token);

    try {
      const res = await fetch("/api/testimonials/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Échec du téléversement");
        return;
      }
      setImage(data.url);
    } catch {
      setError("Erreur réseau lors du téléversement");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/testimonials/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, company, text, image }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Envoi impossible");
        return;
      }
      setDone(true);
    } catch {
      setError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
        <p className="font-display text-2xl text-foreground">
          Merci pour votre témoignage !
        </p>
        <p className="mt-3 text-sm text-muted">
          Votre avis a bien été transmis à l&apos;équipe {brand.name}. Il sera
          relu avant publication sur le site.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Votre nom</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Fonction / rôle</label>
          <input
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Client, Directrice…"
          />
        </div>
        <div>
          <label className={labelClass}>Société (optionnel)</label>
          <input
            className={inputClass}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Votre témoignage</label>
        <textarea
          rows={6}
          className={cn(inputClass, "resize-y")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Décrivez votre expérience avec nous…"
          required
          minLength={20}
        />
        <p className="mt-1 text-xs text-muted">Minimum 20 caractères.</p>
      </div>

      <div>
        <label className={labelClass}>Photo (optionnel)</label>
        <label className="inline-flex cursor-pointer items-center gap-2 border border-border bg-surface px-3 py-2 text-xs font-medium hover:border-gold/40">
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {uploading ? "Téléversement…" : "Ajouter une photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt="Aperçu"
            className="mt-3 max-h-40 border border-border object-contain p-2"
          />
        ) : null}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 bg-gold px-5 py-3 text-sm font-medium text-ink hover:bg-gold-dark disabled:opacity-60 sm:w-auto"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Envoyer mon témoignage
      </button>
    </form>
  );
}
