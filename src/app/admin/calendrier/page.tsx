import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { mockEvents } from "@/data/admin-mock";

const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const june2026 = Array.from({ length: 30 }, (_, i) => i + 1);

export default function AdminCalendrierPage() {
  return (
    <AdminShell
      title="Calendrier"
      description="Vue mensuelle des événements et réunions client."
    >
      <AdminCard title="Juin 2026">
        <div className="grid grid-cols-7 gap-px border border-border bg-border">
          {days.map((d) => (
            <div
              key={d}
              className="bg-stone-50 px-2 py-2 text-center text-[10px] font-semibold text-muted uppercase"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[4.5rem] bg-surface" />
          ))}
          {june2026.map((day) => {
            const hasEvent = mockEvents.some((e) =>
              e.date.endsWith(`-${String(day).padStart(2, "0")}`)
            );
            return (
              <div
                key={day}
                className={`min-h-[4.5rem] border-t border-border/50 bg-surface p-2 ${hasEvent ? "ring-1 ring-inset ring-gold/40" : ""}`}
              >
                <span
                  className={`text-xs font-medium ${hasEvent ? "text-gold" : "text-muted"}`}
                >
                  {day}
                </span>
                {hasEvent && (
                  <span className="mt-1 block h-1.5 w-full bg-gold" />
                )}
              </div>
            );
          })}
        </div>
        <ul className="mt-6 space-y-2">
          {mockEvents.map((e) => (
            <li key={e.id} className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 bg-gold" />
              <span className="text-foreground">{e.date}</span>
              <span className="text-muted">— {e.title}</span>
            </li>
          ))}
        </ul>
      </AdminCard>
    </AdminShell>
  );
}
