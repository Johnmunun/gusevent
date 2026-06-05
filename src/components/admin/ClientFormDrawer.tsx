"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DEFAULT_EVENT_TYPE, eventTypeOptions } from "@/lib/quote";
import type { QuoteFormData } from "@/lib/quote";
import { useToast } from "@/components/ui/toast-context";

type ClientFormDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

const inputClass =
  "w-full border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20";

export function ClientFormDrawer({
  open,
  onClose,
  onCreated,
}: ClientFormDrawerProps) {
  const { showSuccess, showError } = useToast();
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const [form, setForm] = useState<{
    fullName: string;
    email: string;
    phone: string;
    eventType: QuoteFormData["eventType"];
    eventDate: string;
    notes: string;
  }>({
    fullName: "",
    email: "",
    phone: "",
    eventType: DEFAULT_EVENT_TYPE,
    eventDate: "",
    notes: "",
  });

  function resetForm() {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      eventType: DEFAULT_EVENT_TYPE,
      eventDate: "",
      notes: "",
    });
    setReference("");
    setSaved(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        showError("Enregistrement impossible", data.error ?? "Erreur serveur.");
        return;
      }
      setReference(data.reference ?? "");
      setSaved(true);
      showSuccess("Client ajouté", data.reference ?? "Demande créée.");
      onCreated?.();
      window.setTimeout(() => {
        handleClose();
      }, 1200);
    } catch {
      showError("Erreur réseau", "Le client n'a pas pu être enregistré.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Nouveau client"
      description="Crée une demande de devis en base — le client apparaît dans le CRM."
      size="lg"
    >
      {saved ? (
        <div className="p-8 text-center">
          <p className="font-display text-xl text-foreground">Client enregistré</p>
          <p className="mt-2 text-sm text-muted">
            {reference
              ? `Référence ${reference} — visible dans Clients et Demandes devis.`
              : "La fiche est disponible dans le CRM."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                Nom complet *
              </label>
              <input
                type="text"
                required
                className={inputClass}
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                Téléphone *
              </label>
              <input
                type="tel"
                required
                className={inputClass}
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                Email *
              </label>
              <input
                type="email"
                required
                className={inputClass}
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                Type d&apos;événement
              </label>
              <select
                className={inputClass}
                value={form.eventType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    eventType: e.target.value as (typeof eventTypeOptions)[number],
                  }))
                }
              >
                {eventTypeOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                Date souhaitée
              </label>
              <input
                type="date"
                className={inputClass}
                value={form.eventDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, eventDate: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
              Notes
            </label>
            <textarea
              rows={4}
              className={inputClass}
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 bg-gold py-3.5 text-sm font-semibold text-ink hover:bg-gold-dark disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement…
              </>
            ) : (
              "Enregistrer le client"
            )}
          </button>
        </form>
      )}
    </Drawer>
  );
}
