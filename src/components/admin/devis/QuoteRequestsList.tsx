"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Loader2, Mail, MailX, Pencil } from "lucide-react";
import type { QuoteRequestStatus } from "@prisma/client";
import { AdminCard } from "@/components/admin/AdminCard";
import { InvoiceGeneratorModal } from "@/components/admin/devis/InvoiceGeneratorModal";
import { QuoteEditPanel } from "@/components/admin/devis/QuoteEditPanel";

type QuoteRequest = {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  budgetLabel: string;
  status: QuoteRequestStatus;
  clientEmailSent: boolean;
  adminEmailSent: boolean;
  createdAt: string;
};

const STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  NEW: "Prospect",
  IN_PROGRESS: "Devis envoyé",
  REPLIED: "Confirmé",
  CLOSED: "Terminé",
};

export function QuoteRequestsList() {
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [invoiceQuoteId, setInvoiceQuoteId] = useState<string | null>(null);

  async function loadQuotes() {
    const res = await fetch("/api/admin/quotes");
    const data = await res.json();
    setQuotes(data.quotes ?? []);
  }

  useEffect(() => {
    loadQuotes().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) setEditingId(editId);
  }, [searchParams]);

  async function updateStatus(id: string, status: QuoteRequestStatus) {
    await fetch(`/api/admin/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadQuotes();
  }

  const newCount = quotes.filter((q) => q.status === "NEW").length;

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des demandes…
      </p>
    );
  }

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="admin-card bg-surface p-5">
          <p className="text-xs text-muted uppercase">Nouvelles</p>
          <p className="mt-1 font-display text-2xl text-foreground">{newCount}</p>
        </div>
        <div className="admin-card bg-surface p-5">
          <p className="text-xs text-muted uppercase">Total</p>
          <p className="mt-1 font-display text-2xl text-foreground">{quotes.length}</p>
        </div>
        <div className="admin-card bg-surface p-5">
          <p className="text-xs text-muted uppercase">Emails OK</p>
          <p className="mt-1 font-display text-2xl text-foreground">
            {quotes.filter((q) => q.clientEmailSent && q.adminEmailSent).length}
          </p>
        </div>
      </div>

      <AdminCard title="File d'attente" noPadding>
        {quotes.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted">
            Aucune demande pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {quotes.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{req.fullName}</p>
                    <span className="text-[10px] text-muted">{req.reference}</span>
                    {req.status === "NEW" && (
                      <span className="bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold uppercase">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {req.eventType} · {req.budgetLabel}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {req.email} · {req.phone}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInvoiceQuoteId(req.id)}
                    className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-gold hover:text-gold"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Facture
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(req.id)}
                    className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-gold hover:text-gold"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  <select
                    value={req.status}
                    onChange={(e) =>
                      updateStatus(req.id, e.target.value as QuoteRequestStatus)
                    }
                    className="border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-gold/50"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span title="Email client">
                    {req.clientEmailSent ? (
                      <Mail className="h-4 w-4 text-green-600" />
                    ) : (
                      <MailX className="h-4 w-4 text-stone-400" />
                    )}
                  </span>
                  <span title="Email admin">
                    {req.adminEmailSent ? (
                      <Mail className="h-4 w-4 text-green-600" />
                    ) : (
                      <MailX className="h-4 w-4 text-stone-400" />
                    )}
                  </span>
                </div>
                <p className="w-full text-xs text-muted sm:w-auto">
                  {new Date(req.createdAt).toLocaleString("fr-FR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <QuoteEditPanel
        quoteId={editingId}
        onClose={() => setEditingId(null)}
        onSaved={loadQuotes}
        onOpenInvoice={(id) => {
          setEditingId(null);
          setInvoiceQuoteId(id);
        }}
      />

      <InvoiceGeneratorModal
        quoteId={invoiceQuoteId}
        onClose={() => setInvoiceQuoteId(null)}
        onSent={loadQuotes}
      />
    </>
  );
}
