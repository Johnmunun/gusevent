"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { eventTypeOptions } from "@/lib/quote";

type ClientFormDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const inputClass =
  "w-full border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20";

export function ClientFormDrawer({ open, onClose }: ClientFormDrawerProps) {
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Nouveau client"
      description="Ajoutez un prospect ou client — enregistrement à brancher."
      size="lg"
    >
      {saved ? (
        <div className="p-8 text-center">
          <p className="font-display text-xl text-foreground">Client enregistré</p>
          <p className="mt-2 text-sm text-muted">Démonstration — pas encore sauvegardé en base.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                Nom complet *
              </label>
              <input type="text" required className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                Téléphone *
              </label>
              <input type="tel" required className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                Email *
              </label>
              <input type="email" required className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                Type d&apos;événement
              </label>
              <select className={inputClass}>
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
              <input type="date" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
              Notes
            </label>
            <textarea rows={4} className={inputClass} />
          </div>
          <button
            type="submit"
            className="w-full bg-gold py-3.5 text-sm font-semibold text-ink hover:bg-gold-dark"
          >
            Enregistrer le client
          </button>
        </form>
      )}
    </Drawer>
  );
}
