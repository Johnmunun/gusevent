"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Instagram,
  Loader2,
  Mail,
  Share2,
  Sparkles,
} from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import type { MarketingData } from "@/lib/growth/service";

const channelIcons = {
  instagram: Instagram,
  newsletter: Mail,
  site: Share2,
} as const;

export function MarketingPageView() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/marketing", { cache: "no-store", credentials: "same-origin" })
      .then((res) => res.json())
      .then((json: MarketingData) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-12 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement du marketing…
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted">
        Impossible de charger les données marketing.
      </p>
    );
  }

  const { stats, channels, contentIdeas, nurtureLeads } = data;

  return (
    <>
      <div className="admin-welcome mb-8 flex items-start gap-4 px-6 py-6 text-cream">
        <Sparkles className="h-8 w-8 shrink-0 text-gold" />
        <div>
          <p className="font-display text-xl">Croissance & image de marque</p>
          <p className="mt-2 text-sm text-stone-400">
            {stats.totalLeads > 0
              ? `${stats.contactsTotal} contacts et ${stats.conversionRate} % de conversion sur vos demandes de devis.`
              : "Centralisez vos actions marketing pour attirer plus de demandes de devis qualifiées."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Leads ce mois"
          value={String(stats.leadsThisMonth)}
          hint="Demandes reçues"
          trend={stats.leadsThisMonth > 0 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="Contacts"
          value={String(stats.contactsTotal)}
          hint="Emails uniques"
          trend={stats.contactsTotal > 0 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="Conversion"
          value={String(stats.conversionRate)}
          suffix=" %"
          hint="Demandes → confirmées"
          trend={stats.conversionRate >= 50 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="Priorité haute"
          value={String(stats.highPriorityLeads)}
          hint="À relancer sous 48 h"
          trend={stats.highPriorityLeads > 0 ? "neutral" : "down"}
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {channels.map((ch) => {
          const Icon = channelIcons[ch.id as keyof typeof channelIcons] ?? Share2;
          const inner = (
            <>
              <Icon className="h-6 w-6 text-gold" strokeWidth={1.25} />
              <p className="mt-4 font-display text-lg text-foreground">
                {ch.name}
              </p>
              <p className="mt-1 text-sm text-muted">{ch.stat}</p>
              <span className="mt-4 block w-full border border-gold/40 py-2 text-center text-xs font-medium text-gold transition-colors hover:bg-gold/10">
                {ch.action}
              </span>
            </>
          );

          return (
            <AdminCard key={ch.id}>
              {ch.external ? (
                <a href={ch.href} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <Link href={ch.href}>{inner}</Link>
              )}
            </AdminCard>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminCard title="Idées de contenu">
          <ul className="space-y-3 text-sm">
            {contentIdeas.map((idea) => (
              <li key={idea.id} className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    idea.priority === "haute" ? "bg-gold" : "bg-stone-300"
                  }`}
                />
                {idea.href ? (
                  <Link
                    href={idea.href}
                    className="text-foreground hover:text-gold hover:underline"
                  >
                    {idea.text}
                  </Link>
                ) : (
                  <span className="text-muted">{idea.text}</span>
                )}
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard
          title="Leads à relancer"
          action={
            <Link
              href="/admin/devis"
              className="text-sm text-gold hover:underline"
            >
              Voir les devis
            </Link>
          }
        >
          {nurtureLeads.length === 0 ? (
            <p className="text-sm text-muted">
              Aucun lead en attente de réponse.
            </p>
          ) : (
            <ul className="space-y-3">
              {nurtureLeads.map((lead) => (
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
