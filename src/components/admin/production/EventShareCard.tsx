"use client";

import { useEffect, useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { EventShareButtons } from "@/components/share/EventShareButtons";
import type { PublicEventShare } from "@/lib/share/event-share";

type EventShareCardProps = {
  quoteId: string;
  shareEnabled: boolean;
  canShare: boolean;
};

export function EventShareCard({
  quoteId,
  shareEnabled,
  canShare,
}: EventShareCardProps) {
  const [share, setShare] = useState<PublicEventShare | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shareEnabled || !canShare) {
      setShare(null);
      return;
    }

    setLoading(true);
    fetch(`/api/admin/quotes/${quoteId}/share`, { credentials: "same-origin" })
      .then(async (r) => {
        const text = await r.text();
        if (!text) return null;
        try {
          return JSON.parse(text) as { share?: PublicEventShare | null };
        } catch {
          return null;
        }
      })
      .then((data) => setShare(data?.share ?? null))
      .catch(() => setShare(null))
      .finally(() => setLoading(false));
  }, [quoteId, shareEnabled, canShare]);

  if (!canShare) {
    return (
      <p className="text-xs text-muted">
        Partage disponible pour les événements confirmés ou terminés (activez-le
        dans la fiche projet).
      </p>
    );
  }

  if (!shareEnabled) {
    return (
      <p className="text-xs text-muted">
        Partage désactivé — ouvrez la fiche projet pour l&apos;activer.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Chargement…
      </p>
    );
  }

  if (!share) return null;

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        <Share2 className="h-3 w-3" />
        Partager
      </p>
      <EventShareButtons
        url={share.url}
        shareText={share.shareText}
        links={share.links}
        compact
      />
    </div>
  );
}
