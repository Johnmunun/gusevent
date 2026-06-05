"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import { usePublicContact } from "@/components/contact/ContactProvider";
import { brand } from "@/config/brand";
import {
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
import { useToast } from "@/components/ui/toast-context";

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
  mode?: "create" | "edit";
  initialData?: QuoteFormData;
  quoteReference?: string;
  verifyEmail?: string;
  onSubmitted?: () => void;
};

export function QuoteForm({
  variant = "page",
  mode = "create",
  initialData,
  quoteReference,
  verifyEmail,
  onSubmitted,
}: QuoteFormProps) {
  const isDrawer = variant === "drawer";
  const isEdit = mode === "edit";
  const { showSuccess } = useToast();
  const { email, phoneDisplay, telLink, mailtoDevis } = usePublicContact();
  const [form, setForm] = useState(initialData ?? createInitialState);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedReference, setSavedReference] = useState<string | null>(
    quoteReference ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const budgetOptions = getBudgetOptions(form.currency ?? DEFAULT_CURRENCY);

  const update = <K extends keyof QuoteFormData>(
    key: K,
    value: QuoteFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
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

    if (!isEdit && !privacyAccepted) {
      setError("Veuillez accepter la politique de confidentialité pour envoyer votre demande.");
      return;
    }

    setSubmitting(true);
    const payload = {
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company?.trim() || "",
      location: form.location.trim(),
      message: form.message.trim(),
    };

    try {
      const res = await fetch(
        isEdit && quoteReference
          ? `/api/quotes/${encodeURIComponent(quoteReference)}`
          : "/api/quotes",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEdit ? { ...payload, verifyEmail: verifyEmail } : payload
          ),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ??
            (isEdit
              ? "Impossible de mettre à jour la demande."
              : "Impossible d'envoyer la demande.")
        );
        return;
      }
      const ref = data.reference ?? quoteReference ?? null;
      setSavedReference(ref);
      showSuccess(
        isEdit
          ? "Votre demande a bien été mise à jour"
          : "Votre demande de devis a bien été envoyée",
        ref
          ? `Référence ${ref}. L'équipe ${brand.name} vous recontacte très rapidement.`
          : `L'équipe ${brand.name} a bien reçu votre demande et vous recontacte très rapidement.`
      );
      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={cn(
          "bg-surface",
          isDrawer ? "p-6 sm:p-8" : "border border-border p-10 sm:p-14"
        )}
      >
        <p className="label-upper text-gold">
          {isEdit ? "Demande mise à jour" : "Demande envoyée"}
        </p>
        <h2 className="mt-4 font-display text-3xl font-medium text-foreground">
          {isEdit ? "Modifications enregistrées" : "Merci pour votre confiance"}
        </h2>
        <p className="mt-4 max-w-lg text-muted leading-relaxed">
          {isEdit ? "Votre demande a bien été mise à jour" : "Votre demande a bien été enregistrée"}
          {savedReference ? (
            <>
              {" "}
              (réf. <strong className="text-foreground">{savedReference}</strong>)
            </>
          ) : null}
          . L&apos;équipe {brand.name} vous recontactera dans les meilleurs
          délais. Un email de confirmation vous sera envoyé si disponible.
        </p>
        {!isEdit && savedReference ? (
          <Link
            href={`/devis/modifier?ref=${encodeURIComponent(savedReference)}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:text-gold hover:underline"
          >
            Modifier budget ou détails plus tard
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
        <p className="mt-6 border border-border bg-cream/50 px-4 py-3 text-sm leading-relaxed text-muted">
          Pas de réponse sous <strong className="text-foreground">2 heures</strong>{" "}
          ? Contactez notre support :{" "}
          <a href={telLink} className="text-foreground underline-offset-2 hover:text-gold hover:underline">
            {phoneDisplay}
          </a>
          {" "}ou{" "}
          <a href={mailtoDevis} className="text-foreground underline-offset-2 hover:text-gold hover:underline">
            {email}
          </a>
          .
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
          <p className="label-upper">{isEdit ? "Modification" : "Formulaire"}</p>
          <h2 className="mt-4 font-display text-2xl font-medium text-foreground sm:text-3xl">
            {isEdit ? "Mettre à jour votre demande" : "Décrivez votre événement"}
          </h2>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            {isEdit
              ? "Ajustez le budget, la date ou les détails de votre projet. Notre équipe sera notifiée."
              : "Plus votre brief est précis, plus notre proposition sera adaptée à vos attentes."}
          </p>
          {isEdit && quoteReference ? (
            <p className="mt-2 text-xs text-muted">
              Référence : <strong className="text-foreground">{quoteReference}</strong>
            </p>
          ) : null}
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

      <p className="mt-8 border border-border bg-cream/40 px-4 py-3 text-xs leading-relaxed text-muted">
        Après envoi, notre équipe vous recontacte rapidement. Si vous n&apos;avez
        pas de nouvelles sous <strong className="text-foreground">2 heures</strong>,
        contactez le support au{" "}
        <a href={telLink} className="text-foreground underline-offset-2 hover:text-gold hover:underline">
          {phoneDisplay}
        </a>
        {" "}ou par email à{" "}
        <a href={mailtoDevis} className="text-foreground underline-offset-2 hover:text-gold hover:underline">
          {email}
        </a>
        .
      </p>

      {!isEdit ? (
        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => {
              setPrivacyAccepted(e.target.checked);
              setError(null);
            }}
            className="mt-1 h-4 w-4 shrink-0 accent-gold"
            required
          />
          <span>
            J&apos;accepte que mes données soient traitées par {brand.name} pour
            répondre à ma demande de devis, conformément à la{" "}
            <Link href="/confidentialite" className="text-foreground underline-offset-2 hover:text-gold hover:underline">
              politique de confidentialité
            </Link>
            . <span className="text-gold">*</span>
          </span>
        </label>
      ) : null}

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted">
          {isEdit
            ? `Les modifications seront transmises à l'équipe ${brand.name}.`
            : `En envoyant ce formulaire, vous acceptez d'être recontacté par ${brand.name} concernant votre projet.`}
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-gold px-8 py-3.5 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-gold-dark disabled:opacity-60"
        >
          {submitting
            ? isEdit
              ? "Enregistrement…"
              : "Envoi en cours…"
            : isEdit
              ? "Enregistrer les modifications"
              : "Envoyer ma demande"}
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
