"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { EventShareCard } from "@/components/admin/production/EventShareCard";
import type { ProductionEvent } from "@/lib/production/service";

const statusMap = {
  preparation: { label: "En préparation", class: "bg-amber-50 text-amber-800" },
  confirme: { label: "Confirmé", class: "bg-emerald-50 text-emerald-800" },
  urgent: { label: "Urgent", class: "bg-red-50 text-red-700" },
  termine: { label: "Terminé", class: "bg-stone-100 text-muted" },
};

export function EventsPageView() {
  const [events, setEvents] = useState<ProductionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/production", { cache: "no-store", credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => setEvents(data.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des événements…
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="admin-card bg-surface px-6 py-12 text-center text-sm text-muted">
        Aucun événement en production. Les dossiers passent ici quand le statut
        est « Devis envoyé » ou « Confirmé ».
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {events.map((ev) => {
        const st = statusMap[ev.status];
        return (
          <AdminCard key={ev.id} noPadding>
            <div className="border-b border-border bg-ink px-5 py-4 text-cream">
              <p className="font-display text-lg">{ev.title}</p>
              <p className="mt-1 text-sm text-stone-400">{ev.client}</p>
              <p className="mt-0.5 text-[10px] text-stone-500">{ev.reference}</p>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm text-muted">
                <span className="text-foreground">Date :</span> {ev.date}
              </p>
              <p className="text-sm text-muted">
                <span className="text-foreground">Lieu :</span> {ev.location}
              </p>
              <span
                className={`inline-block px-2.5 py-1 text-[10px] font-semibold uppercase ${st.class}`}
              >
                {st.label}
              </span>
              <EventShareCard
                quoteId={ev.id}
                shareEnabled={ev.shareEnabled}
                canShare={["REPLIED", "CLOSED"].includes(ev.quoteStatus)}
              />
              <div className="flex gap-2 pt-2">
                <Link
                  href={`/admin/devis?edit=${ev.id}`}
                  className="flex-1 border border-border py-2 text-center text-xs font-medium hover:border-gold"
                >
                  Fiche projet
                </Link>
                <Link
                  href="/admin/pipeline"
                  className="flex-1 bg-ink py-2 text-center text-xs font-medium text-cream"
                >
                  Pipeline
                </Link>
              </div>
            </div>
          </AdminCard>
        );
      })}
    </div>
  );
}
