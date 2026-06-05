import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { mockDevisRequests } from "@/data/admin-mock";

export default function AdminDevisPage() {
  return (
    <AdminShell
      title="Demandes de devis"
      description="Leads entrants depuis le formulaire /devis — à connecter à la base."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Nouvelles", value: "4" },
          { label: "Répondues", value: "12" },
          { label: "Délai moyen", value: "18 h" },
        ].map((s) => (
          <div key={s.label} className="admin-card bg-surface p-5">
            <p className="text-xs text-muted uppercase">{s.label}</p>
            <p className="mt-1 font-display text-2xl text-foreground">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <AdminCard title="File d'attente" noPadding>
        <ul className="divide-y divide-border">
          {mockDevisRequests.map((req) => (
            <li
              key={req.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{req.name}</p>
                  {req.urgency === "high" && (
                    <span className="bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold uppercase">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {req.eventType} · {req.budget}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="border border-border px-4 py-2 text-xs font-medium hover:border-gold"
                >
                  Voir le détail
                </button>
                <button
                  type="button"
                  className="bg-gold px-4 py-2 text-xs font-medium text-ink hover:bg-gold-dark"
                >
                  Répondre
                </button>
              </div>
              <p className="w-full text-xs text-muted sm:w-auto">{req.date}</p>
            </li>
          ))}
        </ul>
      </AdminCard>
    </AdminShell>
  );
}
