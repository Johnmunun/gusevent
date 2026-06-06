"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { QuoteRequestStatus } from "@prisma/client";
import { AdminCard } from "@/components/admin/AdminCard";
import { ADMIN_CARD_ICONS } from "@/lib/admin/card-icons";
import { PIPELINE_STATUS_LABELS } from "@/lib/pipeline/config";
import type {
  ProductionCalendar,
  ProductionCalendarItem,
} from "@/lib/production/service";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUS_STYLES: Record<
  QuoteRequestStatus,
  { dot: string; badge: string; cell: string }
> = {
  NEW: {
    dot: "bg-stone-400",
    badge: "bg-stone-100 text-stone-700 ring-1 ring-stone-200",
    cell: "from-stone-200/80 to-stone-100/40",
  },
  IN_PROGRESS: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    cell: "from-amber-300/70 to-amber-100/30",
  },
  REPLIED: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
    cell: "from-emerald-300/60 to-emerald-100/25",
  },
  CLOSED: {
    dot: "bg-stone-300",
    badge: "bg-ink/5 text-muted ring-1 ring-border",
    cell: "from-stone-200/50 to-transparent",
  },
};

function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === day
  );
}

function isWeekend(dayIndex: number): boolean {
  return dayIndex === 5 || dayIndex === 6;
}

function groupByDay(items: ProductionCalendarItem[]) {
  const map = new Map<number, ProductionCalendarItem[]>();
  for (const item of items) {
    const list = map.get(item.day) ?? [];
    list.push(item);
    map.set(item.day, list);
  }
  return map;
}

function EventCard({ event }: { event: ProductionCalendarItem }) {
  const style = STATUS_STYLES[event.status];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="overflow-hidden border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3 border-b border-border/70 bg-ink px-4 py-3 text-cream">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-gold/15 font-display text-sm text-gold">
          {event.day}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base leading-tight">
            {event.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-stone-400">{event.client}</p>
        </div>
      </div>
      <div className="space-y-3 px-4 py-3">
        <p className="text-xs text-muted">{event.date}</p>
        <p className="text-[10px] tracking-wide text-stone-400 uppercase">
          {event.reference}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "px-2 py-0.5 text-[10px] font-semibold uppercase",
              style.badge
            )}
          >
            {PIPELINE_STATUS_LABELS[event.status]}
          </span>
          <Link
            href={`/admin/devis?edit=${event.id}`}
            className="text-xs font-medium text-gold hover:underline"
          >
            Ouvrir la fiche
          </Link>
        </div>
      </div>
    </motion.li>
  );
}

export function CalendarPageView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calendar, setCalendar] = useState<ProductionCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/production?year=${year}&month=${month}`,
        { cache: "no-store", credentials: "same-origin" }
      );
      const data = await res.json();
      setCalendar(data.calendar ?? null);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  useEffect(() => {
    const today = new Date();
    const viewingCurrentMonth =
      year === today.getFullYear() && month === today.getMonth() + 1;
    setSelectedDay(viewingCurrentMonth ? today.getDate() : null);
  }, [year, month]);

  const itemsByDay = useMemo(
    () => groupByDay(calendar?.items ?? []),
    [calendar?.items]
  );

  const eventDaySet = useMemo(
    () => new Set(calendar?.eventDays ?? []),
    [calendar?.eventDays]
  );

  const monthDays = calendar
    ? Array.from({ length: calendar.daysInMonth }, (_, i) => i + 1)
    : [];

  const displayedEvents = useMemo(() => {
    const items = calendar?.items ?? [];
    if (selectedDay !== null) {
      return items.filter((e) => e.day === selectedDay);
    }
    return items;
  }, [calendar?.items, selectedDay]);

  function changeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  function goToToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setSelectedDay(now.getDate());
  }

  const viewingToday =
    year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="space-y-6">
      <div className="admin-welcome flex flex-wrap items-center justify-between gap-4 px-5 py-5 text-cream sm:px-6">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
          <div>
            <p className="font-display text-xl capitalize">
              {calendar?.monthLabel ?? "Calendrier"}
            </p>
            <p className="mt-1 text-sm text-stone-400">
              {calendar?.items.length ?? 0} événement
              {(calendar?.items.length ?? 0) !== 1 ? "s" : ""} ·{" "}
              {calendar?.eventDays.length ?? 0} jour
              {(calendar?.eventDays.length ?? 0) !== 1 ? "s" : ""} occupé
              {(calendar?.eventDays.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!viewingToday && (
            <button
              type="button"
              onClick={goToToday}
              className="border border-gold/35 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              Aujourd&apos;hui
            </button>
          )}
          <div className="flex items-center overflow-hidden border border-stone-600/80">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-2.5 text-stone-400 transition-colors hover:bg-stone-800 hover:text-gold"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[7rem] px-2 text-center text-xs font-medium tracking-wide text-stone-300 uppercase">
              {calendar?.monthLabel.split(" ")[0] ?? "—"}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-2.5 text-stone-400 transition-colors hover:bg-stone-800 hover:text-gold"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted">
        {(Object.keys(STATUS_STYLES) as QuoteRequestStatus[]).map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span
              className={cn("h-2 w-2 rounded-full", STATUS_STYLES[status].dot)}
            />
            {PIPELINE_STATUS_LABELS[status]}
          </span>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminCard title="Vue mensuelle" icon={ADMIN_CARD_ICONS.calendar} hover={false} className="overflow-hidden">
          {loading ? (
            <p className="flex items-center gap-2 py-16 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement du calendrier…
            </p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[36rem]">
                <div className="grid grid-cols-7 border-b border-border">
                  {WEEKDAYS.map((label, i) => (
                    <div
                      key={label}
                      className={cn(
                        "px-2 py-3 text-center text-[10px] font-semibold tracking-[0.12em] uppercase",
                        isWeekend(i) ? "text-stone-400" : "text-muted"
                      )}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {Array.from({ length: calendar?.leadingEmpty ?? 0 }).map(
                    (_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="min-h-[5.5rem] border-b border-r border-border/50 bg-accent-light/10 sm:min-h-[6.5rem]"
                      />
                    )
                  )}

                  {monthDays.map((day, index) => {
                    const dayEvents = itemsByDay.get(day) ?? [];
                    const hasEvent = eventDaySet.has(day);
                    const today = isToday(year, month, day);
                    const selected = selectedDay === day;
                    const colIndex =
                      ((calendar?.leadingEmpty ?? 0) + index) % 7;
                    const weekend = isWeekend(colIndex);
                    const primaryStatus = dayEvents[0]?.status;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setSelectedDay((prev) => (prev === day ? null : day))
                        }
                        className={cn(
                          "group relative min-h-[5.5rem] border-b border-r border-border/50 p-2 text-left transition-all sm:min-h-[6.5rem] sm:p-2.5",
                          weekend ? "bg-accent-light/15" : "bg-surface",
                          hasEvent && primaryStatus && "bg-gradient-to-b",
                          hasEvent &&
                            primaryStatus &&
                            STATUS_STYLES[primaryStatus].cell,
                          selected && "ring-2 ring-inset ring-gold/70",
                          today && !selected && "ring-1 ring-inset ring-gold/40",
                          "hover:bg-gold/[0.04] hover:ring-1 hover:ring-inset hover:ring-gold/30"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center text-xs font-semibold transition-colors",
                            today
                              ? "bg-ink text-gold"
                              : hasEvent
                                ? "text-foreground"
                                : "text-muted group-hover:text-foreground"
                          )}
                        >
                          {day}
                        </span>

                        {dayEvents.length > 0 && (
                          <div className="mt-1.5 space-y-1">
                            {dayEvents.slice(0, 2).map((ev) => (
                              <p
                                key={ev.id}
                                className="truncate text-[10px] leading-tight text-foreground/90"
                              >
                                <span
                                  className={cn(
                                    "mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle",
                                    STATUS_STYLES[ev.status].dot
                                  )}
                                />
                                {ev.title}
                              </p>
                            ))}
                            {dayEvents.length > 2 && (
                              <p className="text-[10px] font-medium text-gold">
                                +{dayEvents.length - 2} autre
                                {dayEvents.length - 2 > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </AdminCard>

        <div className="space-y-4">
          <AdminCard
            title={
              selectedDay !== null
                ? `Événements du ${selectedDay}`
                : "Tous les événements"
            }
            hover={false}
            action={
              selectedDay !== null ? (
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="text-xs text-gold hover:underline"
                >
                  Tout voir
                </button>
              ) : undefined
            }
          >
            {loading ? (
              <p className="py-8 text-sm text-muted">…</p>
            ) : displayedEvents.length === 0 ? (
              <div className="py-10 text-center">
                <Sparkles
                  className="mx-auto h-8 w-8 text-stone-300"
                  strokeWidth={1.25}
                />
                <p className="mt-3 text-sm text-muted">
                  {selectedDay !== null
                    ? "Aucun événement ce jour-là."
                    : "Aucun événement planifié ce mois-ci."}
                </p>
                <Link
                  href="/admin/devis"
                  className="mt-4 inline-block text-xs font-medium text-gold hover:underline"
                >
                  Voir les demandes de devis
                </Link>
              </div>
            ) : (
              <ul className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {displayedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </AdminCard>

          <AdminCard hover={false}>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <p className="text-xs leading-relaxed text-muted">
                Les dates proviennent des demandes de devis. Cliquez sur un
                jour pour filtrer, ou ouvrez une fiche pour modifier le
                planning.
              </p>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
