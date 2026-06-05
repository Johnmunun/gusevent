"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Mail, Plus, Trash2, X } from "lucide-react";
import { invoiceConfig } from "@/config/invoice";
import { useToast } from "@/components/ui/toast-context";
import type { InvoiceLineItem } from "@/lib/invoices/validation";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-gold/50";

const labelClass =
  "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted";

type QuoteSummary = {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  eventType: string;
  budgetLabel: string;
  currency: string;
};

type InvoiceGeneratorModalProps = {
  quoteId: string | null;
  onClose: () => void;
  onSent?: () => void;
};

function defaultLineItem(eventType: string): InvoiceLineItem {
  return {
    description: `Prestation événementielle — ${eventType}`,
    quantity: 1,
    unitPrice: 0,
  };
}

export function InvoiceGeneratorModal({
  quoteId,
  onClose,
  onSent,
}: InvoiceGeneratorModalProps) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteSummary | null>(null);
  const [documentType, setDocumentType] = useState<"devis" | "facture">("facture");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    defaultLineItem("Événement"),
  ]);
  const [taxRate, setTaxRate] = useState<number>(invoiceConfig.defaultTaxRate);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [busy, setBusy] = useState<"download" | "send" | null>(null);

  useEffect(() => {
    if (!quoteId) {
      setQuote(null);
      return;
    }

    setLoading(true);
    fetch(`/api/admin/quotes/${quoteId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.id) return;
        setQuote({
          id: data.id,
          reference: data.reference,
          fullName: data.fullName,
          email: data.email,
          eventType: data.eventType,
          budgetLabel: data.budgetLabel,
          currency: data.currency,
        });
        setLineItems([defaultLineItem(data.eventType)]);
        setDocumentType("facture");
        setTaxRate(invoiceConfig.defaultTaxRate);
        setDueDate("");
        setNotes("");
        setCustomMessage("");
      })
      .finally(() => setLoading(false));
  }, [quoteId]);

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (taxRate / 100);
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round((subtotal + taxAmount) * 100) / 100,
    };
  }, [lineItems, taxRate]);

  function updateLine(index: number, patch: Partial<InvoiceLineItem>) {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function addLine() {
    setLineItems((prev) => [
      ...prev,
      defaultLineItem(quote?.eventType ?? "Prestation"),
    ]);
  }

  function removeLine(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function buildPayload(send: boolean) {
    return {
      documentType,
      lineItems: lineItems.map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      taxRate: Number(taxRate),
      dueDate: dueDate || "",
      notes: notes.trim(),
      customMessage: customMessage.trim(),
      send,
    };
  }

  function validateBeforeSubmit(): string | null {
    if (!quote) return "Demande introuvable.";
    if (lineItems.length === 0) return "Ajoutez au moins une ligne.";
    for (const item of lineItems) {
      if (!item.description.trim()) return "Chaque ligne doit avoir une description.";
      if (item.quantity <= 0) return "Les quantités doivent être positives.";
      if (item.unitPrice < 0) return "Les prix unitaires doivent être positifs.";
    }
    if (totals.total <= 0) return "Le montant total doit être supérieur à zéro.";
    return null;
  }

  async function downloadPdf() {
    if (!quoteId) return;
    const validationError = validateBeforeSubmit();
    if (validationError) {
      showError("Facture incomplète", validationError);
      return;
    }

    setBusy("download");
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(buildPayload(false)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showError("Génération impossible", data.error ?? "Erreur serveur.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        `facture-${quote?.reference ?? "document"}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      showSuccess("PDF généré", "Le document a été téléchargé.");
    } catch {
      showError("Erreur réseau", "Impossible de générer le PDF.");
    } finally {
      setBusy(null);
    }
  }

  async function sendToClient() {
    if (!quoteId) return;
    const validationError = validateBeforeSubmit();
    if (validationError) {
      showError("Facture incomplète", validationError);
      return;
    }

    setBusy("send");
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(buildPayload(true)),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(
          "Envoi impossible",
          data.error ?? "Vérifiez la configuration SMTP dans Paramètres."
        );
        return;
      }

      showSuccess(
        "Document envoyé",
        `${data.documentNumber} envoyé à ${quote?.email}`
      );
      onSent?.();
      onClose();
    } catch {
      showError("Erreur réseau", "L'email n'a pas pu être envoyé.");
    } finally {
      setBusy(null);
    }
  }

  if (!quoteId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col border border-border bg-cream shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase text-muted">Facture / devis pro</p>
            <h2 className="font-display text-xl text-foreground">
              {quote?.fullName ?? "…"}
            </h2>
            {quote ? (
              <p className="mt-1 text-xs text-muted">
                {quote.reference} · {quote.eventType} · {quote.budgetLabel} ·{" "}
                {quote.currency}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading || !quote ? (
          <p className="flex flex-1 items-center justify-center gap-2 p-10 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </p>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Type de document</label>
                  <select
                    className={cn(inputClass, "cursor-pointer")}
                    value={documentType}
                    onChange={(e) =>
                      setDocumentType(e.target.value as "devis" | "facture")
                    }
                  >
                    <option value="facture">Facture</option>
                    <option value="devis">Devis</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>TVA (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    className={inputClass}
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Échéance</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Lignes</p>
                  <button
                    type="button"
                    onClick={addLine}
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-gold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter une ligne
                  </button>
                </div>
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid gap-2 border border-border bg-surface p-3 sm:grid-cols-[1fr_80px_120px_36px]"
                    >
                      <div>
                        <label className={labelClass}>Description</label>
                        <input
                          className={inputClass}
                          value={item.description}
                          onChange={(e) =>
                            updateLine(index, { description: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Qté</label>
                        <input
                          type="number"
                          min={0.01}
                          step={1}
                          className={inputClass}
                          value={item.quantity}
                          onChange={(e) =>
                            updateLine(index, { quantity: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>P.U. ({quote.currency})</label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          className={inputClass}
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLine(index, { unitPrice: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="flex items-end justify-center pb-1">
                        <button
                          type="button"
                          disabled={lineItems.length === 1}
                          onClick={() => removeLine(index)}
                          className="p-2 text-muted hover:text-red-600 disabled:opacity-30"
                          aria-label="Supprimer la ligne"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 rounded border border-border bg-surface p-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted uppercase">Sous-total HT</p>
                  <p className="font-medium tabular-nums">
                    {totals.subtotal.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {quote.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase">TVA</p>
                  <p className="font-medium tabular-nums">
                    {totals.taxAmount.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {quote.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase">Total TTC</p>
                  <p className="font-display text-lg tabular-nums text-foreground">
                    {totals.total.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {quote.currency}
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Message email (optionnel)</label>
                <textarea
                  rows={2}
                  className={cn(inputClass, "resize-y")}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Bonjour ${quote.fullName}, veuillez trouver ci-joint votre document…`}
                />
              </div>
              <div>
                <label className={labelClass}>Notes sur le document (optionnel)</label>
                <textarea
                  rows={2}
                  className={cn(inputClass, "resize-y")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Conditions particulières, acompte, etc."
                />
              </div>
              <p className="text-[10px] leading-relaxed text-muted">
                Destinataire : {quote.email}. L&apos;envoi utilise la configuration
                SMTP des Paramètres admin. Le statut passera à « Devis envoyé » si
                la demande est encore nouvelle.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-border p-5 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-border px-4 py-2.5 text-sm text-muted hover:border-gold hover:text-gold"
              >
                Fermer
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={downloadPdf}
                className="inline-flex flex-1 items-center justify-center gap-2 border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:border-gold disabled:opacity-60"
              >
                {busy === "download" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Télécharger PDF
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={sendToClient}
                className="inline-flex flex-1 items-center justify-center gap-2 bg-gold px-4 py-2.5 text-sm font-medium text-ink hover:bg-gold-dark disabled:opacity-60"
              >
                {busy === "send" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Envoyer au client
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
