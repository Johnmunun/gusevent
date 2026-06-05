"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Layout, Loader2 } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import type { CmsOverviewData } from "@/lib/site/service";

function formatDate(iso: string | null): string {
  if (!iso) return "Par défaut";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CmsPageView() {
  const [data, setData] = useState<CmsOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/site/cms", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then((json: CmsOverviewData) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-12 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement du CMS…
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted">Impossible de charger le CMS.</p>;
  }

  return (
    <>
      <div className="admin-welcome mb-8 flex items-start gap-4 px-5 py-5 text-cream sm:px-6">
        <Layout className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
        <div>
          <p className="font-display text-xl">Contenu du site public</p>
          <p className="mt-2 text-sm text-stone-400">
            {data.customizedCount} section{data.customizedCount > 1 ? "s" : ""}{" "}
            personnalisée{data.customizedCount > 1 ? "s" : ""} en base — textes
            et images de la page d&apos;accueil.
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="Sections"
          value={String(data.sections.length)}
          hint="Blocs éditables"
          trend="neutral"
        />
        <AdminStatCard
          label="Personnalisées"
          value={String(data.customizedCount)}
          hint="Sauvegardées en base"
          trend={data.customizedCount > 0 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="Dernière MAJ"
          value={
            data.lastUpdated
              ? new Date(data.lastUpdated).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })
              : "—"
          }
          hint={data.lastUpdated ? formatDate(data.lastUpdated) : "Contenu par défaut"}
          trend="neutral"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.sections.map((section) => (
          <Link
            key={section.slug}
            href={`/admin/cms/${section.slug}`}
            className="group block"
          >
            <AdminCard hover className="h-full transition-all group-hover:border-gold/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Layout className="mb-3 h-5 w-5 text-gold" />
                  <h3 className="font-display text-lg text-foreground">
                    {section.label}
                  </h3>
                  <p className="mt-1 text-xs text-muted">/{section.slug}</p>
                  <p className="mt-3 text-xs text-muted">
                    {section.customized ? (
                      <>
                        Modifié · {formatDate(section.updatedAt)}
                        {section.updatedBy && (
                          <> · {section.updatedBy}</>
                        )}
                      </>
                    ) : (
                      "Contenu par défaut"
                    )}
                  </p>
                  {section.customized && (
                    <span className="mt-2 inline-block bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800 ring-1 ring-emerald-200">
                      En base
                    </span>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-gold" />
              </div>
            </AdminCard>
          </Link>
        ))}
      </div>
    </>
  );
}
