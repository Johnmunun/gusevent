import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, Circle } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import {
  clientStatusLabels,
  clientStatusStyles,
} from "@/data/admin-mock";
import type {
  DashboardActivity,
  DashboardRecentClient,
  DashboardTask,
  DashboardUpcomingEvent,
} from "@/lib/dashboard/service";

type UpcomingEventsProps = {
  events: DashboardUpcomingEvent[];
};

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <AdminCard
      title="Événements à venir"
      action={
        <Link
          href="/admin/calendrier"
          className="text-sm text-gold hover:underline"
        >
          Calendrier
        </Link>
      }
    >
      {events.length === 0 ? (
        <p className="text-sm text-muted">
          Aucun événement planifié pour le moment.
        </p>
      ) : (
        <ul className="space-y-4">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex gap-4 border-b border-border/60 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center bg-ink text-cream">
                <Calendar className="h-4 w-4 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{ev.title}</p>
                <p className="text-sm text-muted">
                  {ev.client} · {ev.date}
                </p>
                <p className="mt-0.5 text-xs text-muted">{ev.location}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}

type TasksWidgetProps = {
  tasks: DashboardTask[];
};

export function TasksWidget({ tasks }: TasksWidgetProps) {
  return (
    <AdminCard
      title="Tâches du jour"
      action={
        <Link href="/admin/taches" className="text-sm text-gold hover:underline">
          Tout voir
        </Link>
      }
    >
      {tasks.length === 0 ? (
        <p className="text-sm text-muted">Aucune tâche en attente.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3">
              {task.done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={
                    task.done
                      ? "text-sm text-muted line-through"
                      : "text-sm text-foreground"
                  }
                >
                  {task.title}
                </p>
                <p className="text-xs text-muted">
                  {task.due} · {task.assignee}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}

type ActivityFeedProps = {
  activities: DashboardActivity[];
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <AdminCard title="Activité récente">
      {activities.length === 0 ? (
        <p className="text-sm text-muted">Aucune activité récente.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((a) => (
            <li key={a.id} className="flex gap-3">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  a.type === "success"
                    ? "bg-emerald-500"
                    : a.type === "alert"
                      ? "bg-amber-500"
                      : a.type === "devis"
                        ? "bg-gold"
                        : "bg-stone-400"
                }`}
              />
              <div>
                <p className="text-sm text-foreground">{a.text}</p>
                <p className="text-xs text-muted">{a.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}

type RecentClientsListProps = {
  clients: DashboardRecentClient[];
};

export function RecentClientsList({ clients }: RecentClientsListProps) {
  return (
    <AdminCard
      title="Clients récents"
      action={
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
        >
          Voir tout
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
      noPadding
    >
      {clients.length === 0 ? (
        <p className="px-5 py-8 text-sm text-muted sm:px-6">
          Aucun client pour le moment.
        </p>
      ) : (
        <ul className="divide-y divide-border/80">
          {clients.map((client) => (
            <li
              key={client.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-accent-light/20 sm:px-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-ink font-display text-sm text-gold">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{client.name}</p>
                  <p className="text-sm text-muted">
                    {client.eventType} · {client.eventDate}
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 text-[10px] font-semibold uppercase ${clientStatusStyles[client.status]}`}
              >
                {clientStatusLabels[client.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
