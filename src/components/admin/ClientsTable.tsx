import {
  clientStatusLabels,
  clientStatusStyles,
  mockClients,
  type MockClient,
} from "@/data/admin-mock";
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
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

function StatusBadge({ status }: { status: MockClient["status"] }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${clientStatusStyles[status]}`}
    >
      {clientStatusLabels[status]}
    </span>
  );
}

export function ClientsTable() {
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
            {mockClients.map((client) => (
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
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-foreground">{client.eventType}</td>
                <td className="px-5 py-4 text-muted">
                  {formatDate(client.eventDate)}
                </td>
                <td className="px-5 py-4 text-muted">{client.budget}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    className="text-xs font-medium text-gold hover:underline"
                  >
                    Ouvrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {mockClients.map((client) => (
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
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
