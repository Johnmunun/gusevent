import type { QuoteRequest, QuoteRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductionEventStatus =
  | "preparation"
  | "confirme"
  | "urgent"
  | "termine";

export type ProductionEvent = {
  id: string;
  reference: string;
  title: string;
  client: string;
  date: string;
  dateIso: string | null;
  location: string;
  status: ProductionEventStatus;
  quoteStatus: QuoteRequestStatus;
  shareEnabled: boolean;
};

export type ProductionTask = {
  id: string;
  quoteId: string;
  title: string;
  due: string;
  done: boolean;
  assignee: string;
};

export type ProductionCalendarItem = {
  id: string;
  date: string;
  day: number;
  title: string;
  client: string;
  reference: string;
  status: QuoteRequestStatus;
};

export type ProductionCalendar = {
  year: number;
  month: number;
  monthLabel: string;
  leadingEmpty: number;
  daysInMonth: number;
  eventDays: number[];
  items: ProductionCalendarItem[];
};

const URGENT_DAYS = 14;

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

function isUrgent(quote: QuoteRequest): boolean {
  const eventDate = parseEventDate(quote.eventDate);
  if (!eventDate) return false;
  const diff = eventDate.getTime() - Date.now();
  const days = diff / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= URGENT_DAYS;
}

function mapEventStatus(quote: QuoteRequest): ProductionEventStatus {
  if (quote.status === "CLOSED") return "termine";
  if (quote.status === "REPLIED") return isUrgent(quote) ? "urgent" : "confirme";
  if (quote.status === "IN_PROGRESS") return isUrgent(quote) ? "urgent" : "preparation";
  return "preparation";
}

function mapQuoteToEvent(quote: QuoteRequest): ProductionEvent {
  return {
    id: quote.id,
    reference: quote.reference,
    title: quote.eventType,
    client: quote.fullName,
    date: formatDisplayDate(quote.eventDate),
    dateIso: quote.eventDate,
    location: quote.location || "À préciser",
    status: mapEventStatus(quote),
    quoteStatus: quote.status,
    shareEnabled: quote.shareEnabled,
  };
}

function formatDueLabel(quote: QuoteRequest): string {
  const eventDate = parseEventDate(quote.eventDate);
  if (eventDate && quote.status === "REPLIED") {
    return eventDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  }

  const created = quote.createdAt;
  const hours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
  if (hours < 24) return "Aujourd'hui";
  if (hours < 48) return "Demain";
  return created.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function mapQuoteToTask(quote: QuoteRequest): ProductionTask {
  const titles: Record<QuoteRequestStatus, string> = {
    NEW: `Répondre à la demande — ${quote.fullName}`,
    IN_PROGRESS: `Suivre le devis — ${quote.fullName}`,
    REPLIED: `Préparer l'événement — ${quote.eventType}`,
    CLOSED: `Clôturé — ${quote.fullName}`,
  };

  return {
    id: quote.id,
    quoteId: quote.id,
    title: titles[quote.status],
    due: formatDueLabel(quote),
    done: quote.status === "CLOSED",
    assignee: "Équipe",
  };
}

function getCalendarMeta(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingEmpty = (first.getDay() + 6) % 7;
  const monthLabel = first.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return { leadingEmpty, daysInMonth, monthLabel };
}

export async function getProductionData(calendarYear?: number, calendarMonth?: number) {
  const now = new Date();
  const year = calendarYear ?? now.getFullYear();
  const month = calendarMonth ?? now.getMonth() + 1;

  const quotes = await prisma.quoteRequest.findMany({
    orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
  });

  const productionQuotes = quotes.filter((q) =>
    ["IN_PROGRESS", "REPLIED", "CLOSED"].includes(q.status)
  );

  const events = productionQuotes
    .filter((q) => q.status !== "CLOSED")
    .map(mapQuoteToEvent)
    .sort((a, b) => {
      const da = parseEventDate(a.dateIso)?.getTime() ?? Infinity;
      const db = parseEventDate(b.dateIso)?.getTime() ?? Infinity;
      return da - db;
    });

  const tasks = quotes.map(mapQuoteToTask);
  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done).slice(0, 12);

  const { leadingEmpty, daysInMonth, monthLabel } = getCalendarMeta(year, month);
  const eventDays = new Set<number>();
  const calendarItems: ProductionCalendarItem[] = [];

  for (const quote of quotes) {
    const parsed = parseEventDate(quote.eventDate);
    if (!parsed) continue;
    if (parsed.getFullYear() !== year || parsed.getMonth() + 1 !== month) continue;

    const day = parsed.getDate();
    eventDays.add(day);
    calendarItems.push({
      id: quote.id,
      date: formatDisplayDate(quote.eventDate),
      day,
      title: quote.eventType,
      client: quote.fullName,
      reference: quote.reference,
      status: quote.status,
    });
  }

  calendarItems.sort((a, b) => a.day - b.day);

  const calendar: ProductionCalendar = {
    year,
    month,
    monthLabel,
    leadingEmpty,
    daysInMonth,
    eventDays: [...eventDays].sort((a, b) => a - b),
    items: calendarItems,
  };

  return { events, tasks: { pending, done }, calendar };
}
