"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ClientFormDrawer } from "@/components/admin/ClientFormDrawer";

export function ClientsToolbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Rechercher un client…"
            className="w-full border border-border bg-surface py-2.5 pr-3 pl-10 text-sm outline-none transition-shadow focus:border-gold/50 focus:shadow-[0_0_0_3px_rgba(201,169,98,0.15)]"
            disabled
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["Tous", "Prospect", "Devis", "Confirmé", "Terminé"] as const).map(
            (filter) => (
              <button
                key={filter}
                type="button"
                className={
                  filter === "Tous"
                    ? "bg-ink px-4 py-2 text-xs font-medium tracking-wide text-cream uppercase transition-transform hover:scale-105"
                    : "border border-border bg-surface px-4 py-2 text-xs font-medium text-muted transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:text-foreground"
                }
              >
                {filter}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="bg-gold px-5 py-2 text-xs font-semibold tracking-wide text-ink uppercase transition-all hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-lg"
          >
            + Nouveau client
          </button>
        </div>
      </div>
      <ClientFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
