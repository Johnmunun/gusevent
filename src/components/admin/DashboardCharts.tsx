"use client";

import { motion } from "framer-motion";
import { AdminCard } from "@/components/admin/AdminCard";
import {
  pipelineColumns,
  revenueByMonth,
  leadsByMonth,
  eventTypeBreakdown,
} from "@/data/admin-mock";

export function RevenueChartAnimated() {
  const max = Math.max(...revenueByMonth.map((m) => m.amount));

  return (
    <AdminCard title="Revenus prévisionnels (6 mois)">
      <div className="flex h-44 items-end justify-between gap-2 sm:h-52">
        {revenueByMonth.map((item, i) => (
          <div
            key={item.month}
            className="group/bar flex flex-1 flex-col items-center gap-2"
          >
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(item.amount / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.05 }}
              className="w-full max-w-[2.75rem] min-h-[8px] origin-bottom bg-gradient-to-t from-gold-dark via-gold to-amber-200 shadow-sm transition-shadow group-hover/bar:shadow-md"
              title={`${item.amount} k DT`}
            />
            <span className="text-[10px] font-medium text-muted group-hover/bar:text-foreground">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

export function LeadsChartAnimated() {
  const max = Math.max(...leadsByMonth.map((m) => m.count));
  const points = leadsByMonth
    .map((m, i) => {
      const x = (i / (leadsByMonth.length - 1)) * 100;
      const y = 100 - (m.count / max) * 80;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <AdminCard title="Demandes de devis / mois">
      <div className="relative h-44 sm:h-48">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(201 169 98 / 0.45)" />
              <stop offset="100%" stopColor="rgb(201 169 98 / 0)" />
            </linearGradient>
          </defs>
          <motion.polygon
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            points={`0,100 ${points} 100,100`}
            fill="url(#leadFill)"
          />
          <motion.polyline
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            fill="none"
            stroke="rgb(201 169 98)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            points={points}
          />
        </svg>
        <div className="mt-3 flex justify-between text-[10px] text-muted">
          {leadsByMonth.map((m) => (
            <span key={m.month}>{m.month}</span>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}

export function PipelineChart() {
  const total = pipelineColumns.reduce((s, c) => s + c.clients.length, 0);

  return (
    <AdminCard title="Pipeline commercial">
      <div className="space-y-4">
        {pipelineColumns.map((col, i) => {
          const pct = total ? Math.round((col.clients.length / total) * 100) : 0;
          return (
            <div key={col.id}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-foreground">{col.title}</span>
                <span className="text-muted">
                  {col.clients.length} · {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden bg-stone-100">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="h-full bg-gradient-to-r from-gold-dark to-gold"
                />
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}

export function EventTypeChart() {
  return (
    <AdminCard title="Répartition par type">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div
          className="relative h-36 w-36 shrink-0 rounded-full"
          style={{
            background: `conic-gradient(
              rgb(201 169 98) 0% ${eventTypeBreakdown[0].pct}%,
              rgb(154 123 60) ${eventTypeBreakdown[0].pct}% ${eventTypeBreakdown[0].pct + eventTypeBreakdown[1].pct}%,
              rgb(107 88 45) ${eventTypeBreakdown[0].pct + eventTypeBreakdown[1].pct}% ${eventTypeBreakdown[0].pct + eventTypeBreakdown[1].pct + eventTypeBreakdown[2].pct}%,
              rgb(60 55 50) ${eventTypeBreakdown[0].pct + eventTypeBreakdown[1].pct + eventTypeBreakdown[2].pct}% 100%
            )`,
          }}
        >
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-surface">
            <span className="font-display text-lg text-foreground">100%</span>
          </div>
        </div>
        <ul className="w-full space-y-3">
          {eventTypeBreakdown.map((row, i) => (
            <motion.li
              key={row.type}
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0"
                  style={{
                    backgroundColor:
                      i === 0
                        ? "rgb(201 169 98)"
                        : i === 1
                          ? "rgb(154 123 60)"
                          : i === 2
                            ? "rgb(107 88 45)"
                            : "rgb(60 55 50)",
                  }}
                />
                {row.type}
              </span>
              <span className="font-medium text-foreground">{row.pct} %</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </AdminCard>
  );
}
