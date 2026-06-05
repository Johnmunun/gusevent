import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { mockEvents } from "@/data/admin-mock";

const statusMap = {
  preparation: { label: "En préparation", class: "bg-amber-50 text-amber-800" },
  confirme: { label: "Confirmé", class: "bg-emerald-50 text-emerald-800" },
  urgent: { label: "Urgent", class: "bg-red-50 text-red-700" },
};

export default function AdminEvenementsPage() {
  return (
    <AdminShell
      title="Événements"
      description="Planning opérationnel de chaque prestation gusEvent."
    >
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {mockEvents.map((ev) => {
          const st = statusMap[ev.status as keyof typeof statusMap];
          return (
            <AdminCard key={ev.id} noPadding>
              <div className="border-b border-border bg-ink px-5 py-4 text-cream">
                <p className="font-display text-lg">{ev.title}</p>
                <p className="mt-1 text-sm text-stone-400">{ev.client}</p>
              </div>
              <div className="space-y-3 p-5">
                <p className="text-sm text-muted">
                  <span className="text-foreground">Date :</span> {ev.date}
                </p>
                <p className="text-sm text-muted">
                  <span className="text-foreground">Lieu :</span> {ev.location}
                </p>
                <span
                  className={`inline-block px-2.5 py-1 text-[10px] font-semibold uppercase ${st.class}`}
                >
                  {st.label}
                </span>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    className="flex-1 border border-border py-2 text-xs font-medium hover:border-gold"
                  >
                    Fiche projet
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-ink py-2 text-xs font-medium text-cream"
                  >
                    Check-list J
                  </button>
                </div>
              </div>
            </AdminCard>
          );
        })}
      </div>
    </AdminShell>
  );
}
