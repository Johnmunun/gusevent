"use client";

import { motion } from "framer-motion";
import { AdminCard } from "@/components/admin/AdminCard";
import type {
  DashboardEventTypeRow,
  DashboardLeadPoint,
  DashboardMonthPoint,
  DashboardPipelineRow,
} from "@/lib/dashboard/service";
import type { ConversionMonthPoint } from "@/lib/growth/service";

type RevenueChartProps = {
  data: DashboardMonthPoint[];
};

export function RevenueChartAnimated({ data }: RevenueChartProps) {
  const max = Math.max(1, ...data.map((m) => m.amount));

  return (
    <AdminCard title="Revenus prévisionnels (6 mois)">
      <div className="flex h-44 items-end justify-between gap-2 sm:h-52">
        {data.map((item, i) => (
          <div
            key={item.month}
            className="group/bar flex flex-1 flex-col items-center gap-2"
          >
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(item.amount / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
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
      <p className="mt-4 text-xs text-muted">
        Estimation à partir des budgets des dossiers confirmés.
      </p>
    </AdminCard>
  );
}

type LeadsChartProps = {
  data: DashboardLeadPoint[];
};

export function LeadsChartAnimated({ data }: LeadsChartProps) {
  const max = Math.max(1, ...data.map((m) => m.count));
  const denom = Math.max(1, data.length - 1);
  const points = data
    .map((m, i) => {
      const x = (i / denom) * 100;
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
          {data.map((m) => (
            <span key={m.month}>{m.month}</span>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}

type PipelineChartProps = {
  data: DashboardPipelineRow[];
};

export function PipelineChart({ data }: PipelineChartProps) {
  const total = data.reduce((s, c) => s + c.count, 0);

  return (
    <AdminCard title="Pipeline commercial">
      <div className="space-y-4">
        {data.map((col, i) => {
          const pct = total ? Math.round((col.count / total) * 100) : 0;
          return (
            <div key={col.id}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-foreground">{col.title}</span>
                <span className="text-muted">
                  {col.count} · {pct}%
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

type EventTypeChartProps = {
  data: DashboardEventTypeRow[];
};

const PIE_COLORS = [
  "rgb(201 169 98)",
  "rgb(154 123 60)",
  "rgb(107 88 45)",
  "rgb(60 55 50)",
];

type ConversionChartProps = {
  data: ConversionMonthPoint[];
};

export function ConversionChartAnimated({ data }: ConversionChartProps) {
  const max = Math.max(1, ...data.map((m) => m.rate));

  return (
    <AdminCard title="Taux de conversion / mois">
      <div className="flex h-44 items-end justify-between gap-2 sm:h-52">
        {data.map((item, i) => (
          <div
            key={item.month}
            className="group/bar flex flex-1 flex-col items-center gap-2"
          >
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(item.rate / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ scale: 1.05 }}
              className="w-full max-w-[2.75rem] min-h-[8px] origin-bottom bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-300 shadow-sm transition-shadow group-hover/bar:shadow-md"
              title={`${item.rate} % (${item.converted}/${item.leads})`}
            />
            <span className="text-[10px] font-medium text-muted group-hover/bar:text-foreground">
              {item.month}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        Part des demandes du mois devenues confirmées ou terminées.
      </p>
    </AdminCard>
  );
}

export function EventTypeChart({ data }: EventTypeChartProps) {
  let cursor = 0;
  const stops = data
    .map((row, i) => {
      const start = cursor;
      cursor += row.pct;
      return `${PIE_COLORS[i % PIE_COLORS.length]} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <AdminCard title="Répartition par type">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div
          className="relative h-36 w-36 shrink-0 rounded-full"
          style={{
            background: `conic-gradient(${stops})`,
          }}
        >
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-surface">
            <span className="font-display text-lg text-foreground">100%</span>
          </div>
        </div>
        <ul className="w-full space-y-3">
          {data.map((row, i) => (
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
                    backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
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
