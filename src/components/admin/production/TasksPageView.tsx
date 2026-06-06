"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { ADMIN_CARD_ICONS } from "@/lib/admin/card-icons";
import type { ProductionTask } from "@/lib/production/service";

export function TasksPageView() {
  const [pending, setPending] = useState<ProductionTask[]>([]);
  const [done, setDone] = useState<ProductionTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/production", { cache: "no-store", credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        setPending(data.tasks?.pending ?? []);
        setDone(data.tasks?.done ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des tâches…
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard title={`À faire (${pending.length})`} icon={ADMIN_CARD_ICONS.tasksPending}>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">
            Aucune tâche en attente — tout est à jour.
          </p>
        ) : (
          <ul className="space-y-3">
            {pending.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-3 border border-border p-4"
              >
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-sm text-muted">
                    {task.due} · {task.assignee}
                  </p>
                  <Link
                    href={`/admin/devis?edit=${task.quoteId}`}
                    className="mt-2 inline-block text-xs text-gold hover:underline"
                  >
                    Ouvrir le dossier
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
      <AdminCard title={`Terminées (${done.length})`} icon={ADMIN_CARD_ICONS.tasksDone}>
        {done.length === 0 ? (
          <p className="text-sm text-muted">Aucun dossier clôturé pour le moment.</p>
        ) : (
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
        )}
      </AdminCard>
    </div>
  );
}
