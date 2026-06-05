import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, Circle } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import {
  clientStatusLabels,
  clientStatusStyles,
  mockActivities,
  mockClients,
  mockEvents,
  mockTasks,
  quickActions,
  revenueByMonth,
} from "@/data/admin-mock";

export function AdminWelcomeBanner() {
  const date = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="admin-welcome mb-8 overflow-hidden px-6 py-8 text-cream sm:px-8 sm:py-10">
      <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
        {date}
      </p>
      <h2 className="mt-3 max-w-xl font-display text-2xl font-medium sm:text-3xl">
        Pilotez votre agence en un seul endroit
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-400">
        Clients, devis, événements, équipe et performance — tout est centralisé
        pour faire grandir gusEvent.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-medium text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RevenueChart() {
  const max = Math.max(...revenueByMonth.map((m) => m.amount));

  return (
    <AdminCard title="Revenus prévisionnels (6 mois)">
      <div className="flex h-40 items-end justify-between gap-2 sm:h-48">
        {revenueByMonth.map((item) => (
          <div
            key={item.month}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div
              className="w-full max-w-[2.5rem] bg-gradient-to-t from-gold-dark to-gold transition-all"
              style={{ height: `${(item.amount / max) * 100}%`, minHeight: 8 }}
              title={`${item.amount}k DT`}
            />
            <span className="text-[10px] text-muted">{item.month}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        Données de démonstration — connectez la compta pour le suivi réel.
      </p>
    </AdminCard>
  );
}

export function UpcomingEvents() {
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
      <ul className="space-y-4">
        {mockEvents.map((ev) => (
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
    </AdminCard>
  );
}

export function TasksWidget() {
  return (
    <AdminCard
      title="Tâches du jour"
      action={
        <Link href="/admin/taches" className="text-sm text-gold hover:underline">
          Tout voir
        </Link>
      }
    >
      <ul className="space-y-3">
        {mockTasks.slice(0, 4).map((task) => (
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
    </AdminCard>
  );
}

export function ActivityFeed() {
  return (
    <AdminCard title="Activité récente">
      <ul className="space-y-4">
        {mockActivities.map((a) => (
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
    </AdminCard>
  );
}

export function RecentClientsList() {
  const recent = mockClients.slice(0, 5);

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
      <ul className="divide-y divide-border/80">
        {recent.map((client) => (
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
    </AdminCard>
  );
}
