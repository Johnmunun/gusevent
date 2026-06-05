"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ClientFormDrawer } from "@/components/admin/ClientFormDrawer";
import { CLIENT_FILTER_LABELS } from "@/lib/clients/config";
import type { ClientStatus } from "@/data/admin-mock";

type FilterKey = "all" | ClientStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "prospect", label: CLIENT_FILTER_LABELS.prospect },
  { key: "devis", label: CLIENT_FILTER_LABELS.devis },
  { key: "confirme", label: CLIENT_FILTER_LABELS.confirme },
  { key: "termine", label: CLIENT_FILTER_LABELS.termine },
];

type ClientsToolbarProps = {
  search: string;
  filter: FilterKey;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: FilterKey) => void;
  onCreated: () => void;
};

export function ClientsToolbar({
  search,
  filter,
  onSearchChange,
  onFilterChange,
  onCreated,
}: ClientsToolbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Rechercher un client…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-border bg-surface py-2.5 pr-3 pl-10 text-sm outline-none transition-shadow focus:border-gold/50 focus:shadow-[0_0_0_3px_rgba(201,169,98,0.15)]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange(key)}
              className={
                filter === key
                  ? "bg-ink px-4 py-2 text-xs font-medium tracking-wide text-cream uppercase transition-transform hover:scale-105"
                  : "border border-border bg-surface px-4 py-2 text-xs font-medium text-muted transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:text-foreground"
              }
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="bg-gold px-5 py-2 text-xs font-semibold tracking-wide text-ink uppercase transition-all hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-lg"
          >
            + Nouveau client
          </button>
        </div>
      </div>
      <ClientFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={() => {
          onCreated();
          setDrawerOpen(false);
        }}
      />
    </>
  );
}
