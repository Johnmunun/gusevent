import type { QuoteRequest } from "@prisma/client";
import type { BudgetRangeId } from "@/lib/quote";
import type { ClientStatus } from "@/data/admin-mock";
import { QUOTE_TO_CLIENT_STATUS } from "@/lib/clients/config";
import { PIPELINE_COLUMNS } from "@/lib/pipeline/config";
import { prisma } from "@/lib/prisma";

export type DashboardStat = {
  label: string;
  value: string;
  suffix?: string;
  hint: string;
  trend: "up" | "down" | "neutral";
};

export type DashboardPipelineRow = {
  id: string;
  title: string;
  count: number;
};

export type DashboardMonthPoint = {
  month: string;
  amount: number;
};

export type DashboardLeadPoint = {
  month: string;
  count: number;
};

export type DashboardEventTypeRow = {
  type: string;
  pct: number;
  count: number;
};

export type DashboardRecentClient = {
  id: string;
  name: string;
  eventType: string;
  eventDate: string;
  status: ClientStatus;
};

export type DashboardActivity = {
  id: string;
  text: string;
  time: string;
  type: "success" | "alert" | "devis" | "info";
};

export type DashboardUpcomingEvent = {
  id: string;
  title: string;
  client: string;
  date: string;
  location: string;
};

export type DashboardTask = {
  id: string;
  title: string;
  due: string;
  done: boolean;
  assignee: string;
};

export type DashboardData = {
  stats: DashboardStat[];
  pipeline: DashboardPipelineRow[];
  revenueByMonth: DashboardMonthPoint[];
  leadsByMonth: DashboardLeadPoint[];
  eventTypeBreakdown: DashboardEventTypeRow[];
  recentClients: DashboardRecentClient[];
  activities: DashboardActivity[];
  upcomingEvents: DashboardUpcomingEvent[];
  tasks: DashboardTask[];
};

const HIGH_PRIORITY_MS = 48 * 60 * 60 * 1000;
const UPCOMING_DAYS = 60;

const BUDGET_MIDPOINTS: Record<BudgetRangeId, number> = {
  tbd: 0,
  lt5k: 2500,
  "5k-15k": 10000,
  "15k-30k": 22500,
  "30k-50k": 40000,
  gt50k: 60000,
};

function parseEventDate(value: string | null): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDisplayDate(value: string | null): string {
  const parsed = parseEventDate(value);
  if (!parsed) return "Date à préciser";
  return parsed.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateBudget(quote: QuoteRequest): number {
  const id = quote.budget as BudgetRangeId;
  return BUDGET_MIDPOINTS[id] ?? 0;
}

function formatAmount(n: number): string {
  return Math.round(n).toLocaleString("fr-FR");
}

function getLast6MonthBuckets() {
  const buckets: { year: number; month: number; label: string; key: string }[] =
    [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d
        .toLocaleDateString("fr-FR", { month: "short" })
        .replace(/\.$/, "")
        .replace(/^./, (c) => c.toUpperCase()),
      key: `${d.getFullYear()}-${d.getMonth()}`,
    });
  }
  return buckets;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "Il y a 1 h" : `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function categorizeEventType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("mariage")) return "Mariages";
  if (
    t.includes("entreprise") ||
    t.includes("conférence") ||
    t.includes("conference") ||
    t.includes("salon") ||
    t.includes("corporate")
  ) {
    return "Corporate";
  }
  if (t.includes("surprise")) return "Surprises";
  return "Autres";
}

function isHighPriority(quote: QuoteRequest): boolean {
  if (quote.status !== "NEW") return false;
  return Date.now() - quote.createdAt.getTime() < HIGH_PRIORITY_MS;
}

function countUpcoming(quotes: QuoteRequest[]): number {
  const now = Date.now();
  const limit = now + UPCOMING_DAYS * 24 * 60 * 60 * 1000;
  return quotes.filter((q) => {
    if (!["IN_PROGRESS", "REPLIED"].includes(q.status)) return false;
    const d = parseEventDate(q.eventDate);
    if (!d) return false;
    const t = d.getTime();
    return t >= now && t <= limit;
  }).length;
}

function trendFromDelta(delta: number): "up" | "down" | "neutral" {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "neutral";
}

function buildStats(quotes: QuoteRequest[]): DashboardStat[] {
  const confirmed = quotes.filter((q) =>
    ["REPLIED", "CLOSED"].includes(q.status)
  );
  const forecast = confirmed.reduce((sum, q) => sum + estimateBudget(q), 0);

  const pending = quotes.filter((q) => q.status === "NEW");
  const highPriority = pending.filter(isHighPriority).length;

  const upcoming = countUpcoming(quotes);
  const total = quotes.length;
  const conversion =
    total > 0 ? Math.round((confirmed.length / total) * 100) : 0;

  const emails = new Set(quotes.map((q) => q.email.toLowerCase()));
  const activeClients = [...emails].filter((email) =>
    quotes.some(
      (q) => q.email.toLowerCase() === email && q.status !== "CLOSED"
    )
  ).length;

  const now = new Date();
  const thisMonthKey = monthKey(now);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = monthKey(lastMonth);

  const leadsThisMonth = quotes.filter(
    (q) => monthKey(q.createdAt) === thisMonthKey
  ).length;
  const leadsLastMonth = quotes.filter(
    (q) => monthKey(q.createdAt) === lastMonthKey
  ).length;
  const leadsDelta = leadsThisMonth - leadsLastMonth;

  return [
    {
      label: "Chiffre prévisionnel",
      value: formatAmount(forecast),
      suffix: " DT",
      hint:
        confirmed.length > 0
          ? `${confirmed.length} dossier${confirmed.length > 1 ? "s" : ""} confirmé${confirmed.length > 1 ? "s" : ""}`
          : "Estimation budgets confirmés",
      trend: confirmed.length > 0 ? "up" : "neutral",
    },
    {
      label: "Devis en attente",
      value: String(pending.length),
      hint:
        highPriority > 0
          ? `${highPriority} priorité haute`
          : "Nouvelles demandes",
      trend: pending.length > 0 ? "neutral" : "down",
    },
    {
      label: "Événements à venir",
      value: String(upcoming),
      hint: `Dans les ${UPCOMING_DAYS} prochains jours`,
      trend: upcoming > 0 ? "up" : "neutral",
    },
    {
      label: "Taux conversion",
      value: String(conversion),
      suffix: " %",
      hint: "Demandes → confirmées",
      trend: conversion >= 50 ? "up" : "neutral",
    },
    {
      label: "Clients actifs",
      value: String(activeClients),
      hint: `${emails.size} contact${emails.size > 1 ? "s" : ""} au total`,
      trend: activeClients > 0 ? "up" : "neutral",
    },
    {
      label: "Demandes ce mois",
      value: String(leadsThisMonth),
      hint:
        leadsDelta === 0
          ? "Stable vs mois dernier"
          : `${leadsDelta > 0 ? "+" : ""}${leadsDelta} vs mois dernier`,
      trend: trendFromDelta(leadsDelta),
    },
  ];
}

function buildPipeline(quotes: QuoteRequest[]): DashboardPipelineRow[] {
  return PIPELINE_COLUMNS.map((col) => ({
    id: col.id,
    title: col.title,
    count: quotes.filter((q) => q.status === col.id).length,
  }));
}

function buildRevenueByMonth(quotes: QuoteRequest[]): DashboardMonthPoint[] {
  const buckets = getLast6MonthBuckets();
  const totals = new Map(buckets.map((b) => [b.key, 0]));

  for (const quote of quotes) {
    if (!["REPLIED", "CLOSED"].includes(quote.status)) continue;
    const key = monthKey(quote.createdAt);
    if (!totals.has(key)) continue;
    totals.set(key, (totals.get(key) ?? 0) + estimateBudget(quote));
  }

  return buckets.map((b) => ({
    month: b.label,
    amount: Math.round((totals.get(b.key) ?? 0) / 1000),
  }));
}

function buildLeadsByMonth(quotes: QuoteRequest[]): DashboardLeadPoint[] {
  const buckets = getLast6MonthBuckets();
  const counts = new Map(buckets.map((b) => [b.key, 0]));

  for (const quote of quotes) {
    const key = monthKey(quote.createdAt);
    if (!counts.has(key)) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return buckets.map((b) => ({
    month: b.label,
    count: counts.get(b.key) ?? 0,
  }));
}

function buildEventTypeBreakdown(
  quotes: QuoteRequest[]
): DashboardEventTypeRow[] {
  const counts = new Map<string, number>();
  for (const quote of quotes) {
    const cat = categorizeEventType(quote.eventType);
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }

  const total = quotes.length;
  if (total === 0) {
    return [{ type: "Aucune donnée", pct: 100, count: 0 }];
  }

  const order = ["Mariages", "Corporate", "Surprises", "Autres"];
  return order
    .filter((type) => (counts.get(type) ?? 0) > 0)
    .map((type) => {
      const count = counts.get(type) ?? 0;
      return {
        type,
        count,
        pct: Math.round((count / total) * 100),
      };
    });
}

function buildRecentClients(quotes: QuoteRequest[]): DashboardRecentClient[] {
  const seen = new Set<string>();
  const clients: DashboardRecentClient[] = [];

  const sorted = [...quotes].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  for (const quote of sorted) {
    const key = quote.email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    clients.push({
      id: quote.id,
      name: quote.fullName,
      eventType: quote.eventType,
      eventDate: quote.eventDate
        ? formatDisplayDate(quote.eventDate)
        : "À préciser",
      status: QUOTE_TO_CLIENT_STATUS[quote.status],
    });
    if (clients.length >= 5) break;
  }

  return clients;
}

function buildUpcomingEvents(
  quotes: QuoteRequest[]
): DashboardUpcomingEvent[] {
  const now = Date.now();
  return quotes
    .filter((q) => ["IN_PROGRESS", "REPLIED"].includes(q.status))
    .map((q) => ({ quote: q, date: parseEventDate(q.eventDate) }))
    .filter((row) => row.date && row.date.getTime() >= now)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime())
    .slice(0, 4)
    .map(({ quote }) => ({
      id: quote.id,
      title: quote.eventType,
      client: quote.fullName,
      date: formatDisplayDate(quote.eventDate),
      location: quote.location || "À préciser",
    }));
}

function formatDueLabel(quote: QuoteRequest): string {
  const eventDate = parseEventDate(quote.eventDate);
  if (eventDate && quote.status === "REPLIED") {
    return eventDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  }

  const hours = (Date.now() - quote.createdAt.getTime()) / (1000 * 60 * 60);
  if (hours < 24) return "Aujourd'hui";
  if (hours < 48) return "Demain";
  return quote.createdAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function buildTasks(quotes: QuoteRequest[]): DashboardTask[] {
  const titles: Record<QuoteRequest["status"], string> = {
    NEW: "Répondre à la demande",
    IN_PROGRESS: "Suivre le devis",
    REPLIED: "Préparer l'événement",
    CLOSED: "Clôturé",
  };

  const priority: Record<QuoteRequest["status"], number> = {
    NEW: 0,
    IN_PROGRESS: 1,
    REPLIED: 2,
    CLOSED: 3,
  };

  return [...quotes]
    .filter((q) => q.status !== "CLOSED")
    .sort((a, b) => priority[a.status] - priority[b.status])
    .slice(0, 4)
    .map((quote) => ({
      id: quote.id,
      title: `${titles[quote.status]} — ${quote.fullName}`,
      due: formatDueLabel(quote),
      done: false,
      assignee: "Équipe",
    }));
}

function mapNotificationType(
  type: string,
  title: string
): DashboardActivity["type"] {
  if (type === "event_reminder") return "alert";
  if (type === "quote_request") return "devis";
  if (title.toLowerCase().includes("confirm")) return "success";
  if (title.toLowerCase().includes("rappel")) return "alert";
  return "info";
}

export async function getDashboardData(): Promise<DashboardData> {
  const [quotes, notifications] = await Promise.all([
    prisma.quoteRequest.findMany({
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const activities: DashboardActivity[] = notifications.map((n) => ({
    id: n.id,
    text: n.message || n.title,
    time: relativeTime(n.createdAt),
    type: mapNotificationType(n.type, n.title),
  }));

  if (activities.length === 0 && quotes.length > 0) {
    const latest = quotes[0];
    activities.push({
      id: "fallback-latest",
      text: `Dernière demande — ${latest.fullName}`,
      time: relativeTime(latest.createdAt),
      type: "devis",
    });
  }

  return {
    stats: buildStats(quotes),
    pipeline: buildPipeline(quotes),
    revenueByMonth: buildRevenueByMonth(quotes),
    leadsByMonth: buildLeadsByMonth(quotes),
    eventTypeBreakdown: buildEventTypeBreakdown(quotes),
    recentClients: buildRecentClients(quotes),
    activities,
    upcomingEvents: buildUpcomingEvents(quotes),
    tasks: buildTasks(quotes),
  };
}
