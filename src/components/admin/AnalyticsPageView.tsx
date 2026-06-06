"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { ADMIN_CARD_ICONS } from "@/lib/admin/card-icons";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  ConversionChartAnimated,
  EventTypeChart,
  LeadsChartAnimated,
  PipelineChart,
  RevenueChartAnimated,
} from "@/components/admin/DashboardCharts";
import type { AnalyticsData } from "@/lib/growth/service";

export function AnalyticsPageView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics", { cache: "no-store", credentials: "same-origin" })
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((json: AnalyticsData) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-12 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des analytics…
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted">
        Impossible de charger les analytics.
      </p>
    );
  }

  const lastRevenue = data.revenueByMonth.at(-1)?.amount ?? 0;
  const lastLeads = data.leadsByMonth.at(-1)?.count ?? 0;
  const pendingStat = data.stats.find((s) => s.label === "Devis en attente");
  const forecastStat = data.stats.find((s) => s.label === "Chiffre prévisionnel");
  const confirmedHint = forecastStat?.hint ?? "";
  const confirmedCount = Number.parseInt(
    confirmedHint.match(/(\d+)/)?.[1] ?? "0",
    10
  );
  const forecastValue = Number.parseInt(
    (forecastStat?.value ?? "0").replace(/\s/g, ""),
    10
  );
  const avgBasket =
    confirmedCount > 0 ? Math.round(forecastValue / confirmedCount) : 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="CA mensuel"
          value={String(lastRevenue)}
          suffix=" k DT"
          hint="Dossiers confirmés ce mois"
          trend={lastRevenue > 0 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="Panier moyen"
          value={avgBasket > 0 ? avgBasket.toLocaleString("fr-FR") : "0"}
          suffix=" DT"
          hint="Budget moyen estimé"
          trend={avgBasket > 0 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="Leads / mois"
          value={String(lastLeads)}
          hint={
            pendingStat
              ? `${pendingStat.value} en attente`
              : "Demandes reçues"
          }
          trend={lastLeads > 0 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="Taux conversion"
          value={
            data.stats.find((s) => s.label === "Taux conversion")?.value ?? "0"
          }
          suffix=" %"
          hint="Demandes → confirmées"
          trend="neutral"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <RevenueChartAnimated data={data.revenueByMonth} />
        <LeadsChartAnimated data={data.leadsByMonth} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PipelineChart data={data.pipeline} />
        </div>
        <EventTypeChart data={data.eventTypeBreakdown} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ConversionChartAnimated data={data.conversionByMonth} />
        <AdminCard
          title="Leads à convertir"
          icon={ADMIN_CARD_ICONS.nurtureLeads}
          action={
            <Link
              href="/admin/devis"
              className="text-sm text-gold hover:underline"
            >
              Voir les devis
            </Link>
          }
        >
          {data.nurtureLeads.length === 0 ? (
            <p className="text-sm text-muted">
              Aucun prospect en attente de réponse.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.nurtureLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {lead.name}
                    </p>
                    <p className="text-xs text-muted">
                      {lead.eventType} · {lead.createdAt}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      lead.priority === "haute"
                        ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                        : "bg-stone-100 text-stone-600 ring-1 ring-stone-200"
                    }`}
                  >
                    {lead.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </>
  );
}
