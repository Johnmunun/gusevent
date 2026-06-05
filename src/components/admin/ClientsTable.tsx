"use client";

import Link from "next/link";
import {
  clientStatusLabels,
  clientStatusStyles,
  type ClientStatus,
} from "@/data/admin-mock";
import type { AdminClient } from "@/lib/clients/service";

function formatDate(iso: string) {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink font-display text-sm text-gold">
      {name.charAt(0)}
    </div>
  );
}

function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${clientStatusStyles[status]}`}
    >
      {clientStatusLabels[status]}
    </span>
  );
}

type ClientsTableProps = {
  clients: AdminClient[];
  onStatusChange: (quoteId: string, status: ClientStatus) => void;
};

export function ClientsTable({ clients, onStatusChange }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <p className="admin-card bg-surface px-6 py-12 text-center text-sm text-muted">
        Aucun client pour le moment. Les demandes de devis apparaissent ici
        automatiquement.
      </p>
    );
  }

  return (
    <>
      <div className="admin-card hidden overflow-hidden bg-surface md:block">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-stone-50/80 text-[10px] tracking-[0.12em] text-muted uppercase">
              <th className="px-5 py-4 font-semibold">Client</th>
              <th className="px-5 py-4 font-semibold">Événement</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Budget</th>
              <th className="px-5 py-4 font-semibold">Statut</th>
              <th className="px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-accent-light/25"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={client.name} />
                    <div>
                      <p className="font-medium text-foreground">
                        {client.name}
                        {client.priority === "haute" && (
                          <span className="ml-2 text-[10px] font-bold text-gold">
                            ★
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted">{client.email}</p>
                      {client.quotesCount > 1 ? (
                        <p className="text-[10px] text-muted">
                          {client.quotesCount} demandes
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-foreground">{client.eventType}</td>
                <td className="px-5 py-4 text-muted">
                  {formatDate(client.eventDate)}
                </td>
                <td className="px-5 py-4 text-muted">{client.budget}</td>
                <td className="px-5 py-4">
                  <select
                    value={client.status}
                    onChange={(e) =>
                      onStatusChange(
                        client.quoteId,
                        e.target.value as ClientStatus
                      )
                    }
                    className="border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-gold/50"
                  >
                    {Object.entries(clientStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/devis?edit=${client.quoteId}`}
                    className="text-xs font-medium text-gold hover:underline"
                  >
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {clients.map((client) => (
          <article key={client.id} className="admin-card bg-surface p-4">
            <div className="flex items-start gap-3">
              <Avatar name={client.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{client.name}</p>
                  <StatusBadge status={client.status} />
                </div>
                <p className="text-xs text-muted">{client.eventType}</p>
                <p className="mt-2 text-xs text-muted">{client.budget}</p>
                <Link
                  href={`/admin/devis?edit=${client.quoteId}`}
                  className="mt-3 inline-block text-xs font-medium text-gold hover:underline"
                >
                  Ouvrir la demande
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
