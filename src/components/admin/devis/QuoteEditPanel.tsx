"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FileText, Loader2, X } from "lucide-react";
import type { QuoteRequestStatus } from "@prisma/client";
import {
  currencies,
  eventTypeOptions,
  getBudgetOptions,
  type BudgetRangeId,
  type CurrencyCode,
  type QuoteFormData,
} from "@/lib/quote";
import { QuoteEngagementPanel } from "@/components/admin/devis/QuoteEngagementPanel";
import { useToast } from "@/components/ui/toast-context";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-gold/50";

const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted";

const STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  NEW: "Prospect",
  IN_PROGRESS: "Devis envoyé",
  REPLIED: "Confirmé",
  CLOSED: "Terminé",
};

type QuoteEditPanelProps = {
  quoteId: string | null;
  onClose: () => void;
  onSaved: () => void;
  onOpenInvoice?: (quoteId: string) => void;
};

export function QuoteEditPanel({
  quoteId,
  onClose,
  onSaved,
  onOpenInvoice,
}: QuoteEditPanelProps) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState<QuoteRequestStatus>("NEW");
  const [shareEnabled, setShareEnabled] = useState(false);
  const [form, setForm] = useState<QuoteFormData | null>(null);

  useEffect(() => {
    if (!quoteId) {
      setForm(null);
      return;
    }

    setLoading(true);
    fetch(`/api/admin/quotes/${quoteId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.id) return;
        setReference(data.reference);
        setStatus(data.status);
        setShareEnabled(Boolean(data.shareEnabled));
        setForm({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          company: data.company ?? "",
          eventType: data.eventType,
          eventDate: data.eventDate ?? "",
          guestCount: data.guestCount ?? "",
          currency: data.currency as CurrencyCode,
          budget: data.budget as BudgetRangeId,
          location: data.location ?? "",
          message: data.message ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [quoteId]);

  if (!quoteId) return null;

  const budgetOptions = form
    ? getBudgetOptions(form.currency)
    : [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form || !quoteId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status, shareEnabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError("Enregistrement impossible", data.error ?? "Erreur serveur.");
        return;
      }
      showSuccess("Demande mise à jour", reference);
      onSaved();
      onClose();
    } catch {
      showError("Erreur réseau", "La modification n'a pas été enregistrée.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs text-muted uppercase">Modifier la demande</p>
            <p className="font-medium text-foreground">{reference || "…"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted transition-colors hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading || !form ? (
          <p className="flex flex-1 items-center justify-center gap-2 p-8 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div>
                <label className={labelClass}>Statut</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuoteRequestStatus)}
                  className={cn(inputClass, "cursor-pointer")}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nom</label>
                  <input
                    className={inputClass}
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Société</label>
                  <input
                    className={inputClass}
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Type d&apos;événement</label>
                  <select
                    className={cn(inputClass, "cursor-pointer")}
                    value={form.eventType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        eventType: e.target.value as QuoteFormData["eventType"],
                      })
                    }
                  >
                    {eventTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Invités</label>
                  <input
                    className={inputClass}
                    value={form.guestCount}
                    onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Devise</label>
                  <select
                    className={cn(inputClass, "cursor-pointer")}
                    value={form.currency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        currency: e.target.value as CurrencyCode,
                      })
                    }
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Budget</label>
                  <select
                    className={cn(inputClass, "cursor-pointer")}
                    value={form.budget}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        budget: e.target.value as BudgetRangeId,
                      })
                    }
                  >
                    {budgetOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Lieu</label>
                  <input
                    className={inputClass}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Message</label>
                  <textarea
                    rows={4}
                    className={cn(inputClass, "resize-y")}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
              </div>

              {quoteId ? (
                <QuoteEngagementPanel
                  quoteId={quoteId}
                  shareEnabled={shareEnabled}
                  onShareEnabledChange={setShareEnabled}
                />
              ) : null}
            </div>

            <div className="flex flex-col gap-2 border-t border-border p-5">
              {onOpenInvoice && quoteId ? (
                <button
                  type="button"
                  onClick={() => onOpenInvoice(quoteId)}
                  className="inline-flex w-full items-center justify-center gap-2 border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gold/20"
                >
                  <FileText className="h-4 w-4" />
                  Générer facture / devis PDF
                </button>
              ) : null}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-border px-4 py-2.5 text-sm text-muted hover:border-gold hover:text-gold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gold px-4 py-2.5 text-sm font-medium text-ink hover:bg-gold-dark disabled:opacity-60"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
