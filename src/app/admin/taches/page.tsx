import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { mockTasks } from "@/data/admin-mock";
import { CheckCircle2, Circle } from "lucide-react";

export default function AdminTachesPage() {
  const pending = mockTasks.filter((t) => !t.done);
  const done = mockTasks.filter((t) => t.done);

  return (
    <AdminShell
      title="Tâches équipe"
      description="Organisation interne — rappels, livrables et coordination."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title={`À faire (${pending.length})`}>
          <ul className="space-y-3">
            {pending.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-3 border border-border p-4"
              >
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-sm text-muted">
                    {task.due} · {task.assignee}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
        <AdminCard title={`Terminées (${done.length})`}>
          <ul className="space-y-3">
            {done.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-3 border border-border/60 bg-stone-50/50 p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-foreground line-through">{task.title}</p>
                  <p className="text-sm text-muted">{task.due}</p>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
