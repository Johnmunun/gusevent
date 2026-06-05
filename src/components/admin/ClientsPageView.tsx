"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { ClientsToolbar } from "@/components/admin/ClientsToolbar";
import type { ClientStatus } from "@/data/admin-mock";
import type { AdminClient, AdminClientStats } from "@/lib/clients/service";

type FilterKey = "all" | ClientStatus;

export function ClientsPageView() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [stats, setStats] = useState<AdminClientStats>({
    total: 0,
    confirmed: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const fetchClients = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (filter !== "all") params.set("status", filter);

      const res = await fetch(`/api/admin/clients?${params.toString()}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        clients: AdminClient[];
        stats: AdminClientStats;
      };
      setClients(data.clients);
      setStats(data.stats);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(fetchClients, search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [fetchClients, search]);

  async function updateStatus(quoteId: string, status: ClientStatus) {
    const res = await fetch(`/api/admin/clients/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ status }),
    });
    if (res.ok) await fetchClients();
  }

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="Total clients"
          value={String(stats.total)}
          trend="up"
        />
        <AdminStatCard
          label="Confirmés"
          value={String(stats.confirmed)}
          hint="Événements signés"
          trend="up"
        />
        <AdminStatCard
          label="Priorité haute"
          value={String(stats.highPriority)}
          trend="neutral"
        />
      </div>

      <ClientsToolbar
        search={search}
        filter={filter}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
        onCreated={fetchClients}
      />

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement des clients…
        </p>
      ) : (
        <ClientsTable
          clients={clients}
          onStatusChange={updateStatus}
        />
      )}
    </>
  );
}
