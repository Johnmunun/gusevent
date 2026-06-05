"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Link2,
  Loader2,
  Mail,
  MessageSquare,
  Share2,
} from "lucide-react";
import { EventShareButtons } from "@/components/share/EventShareButtons";
import type { PublicEventShare } from "@/lib/share/event-share";
import { useToast } from "@/components/ui/toast-context";

type QuoteEngagementPanelProps = {
  quoteId: string;
  shareEnabled: boolean;
  onShareEnabledChange: (value: boolean) => void;
};

export function QuoteEngagementPanel({
  quoteId,
  shareEnabled,
  onShareEnabledChange,
}: QuoteEngagementPanelProps) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [share, setShare] = useState<PublicEventShare | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/admin/quotes/${quoteId}/share`, { credentials: "same-origin" })
      .then(async (r) => {
        const text = await r.text();
        if (!text) return null;
        try {
          return JSON.parse(text) as {
            canShare?: boolean;
            share?: PublicEventShare | null;
            testimonialLink?: string | null;
            error?: string;
          };
        } catch {
          return null;
        }
      })
      .then((shareData) => {
        if (cancelled || !shareData) return;
        setCanShare(shareData.canShare ?? false);
        setShare(shareData.share ?? null);
        if (shareData.testimonialLink) setInviteLink(shareData.testimonialLink);
      })
      .catch(() => {
        if (!cancelled) showError("Chargement impossible", "Partage & témoignage");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  async function createInvite(sendEmail: boolean) {
    setInviteLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ quoteId, sendEmail }),
      });
      const text = await res.text();
      let data: { link?: string; error?: string } = {};
      if (text) {
        try {
          data = JSON.parse(text) as { link?: string; error?: string };
        } catch {
          data = {};
        }
      }
      if (!res.ok) {
        showError("Invitation impossible", data.error ?? "Erreur serveur");
        return;
      }
      if (!data.link) {
        showError("Invitation impossible", "Réponse serveur invalide");
        return;
      }
      setInviteLink(data.link);
      showSuccess(
        sendEmail ? "Lien envoyé par email" : "Lien de témoignage prêt",
        data.link
      );
    } catch {
      showError("Erreur réseau");
    } finally {
      setInviteLoading(false);
    }
  }

  async function copyInvite() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch {
      showError("Copie impossible");
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Chargement partage & témoignage…
      </p>
    );
  }

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
          <MessageSquare className="h-3.5 w-3.5" />
          Témoignage client
        </p>
        <p className="text-xs text-muted">
          Envoyez un lien personnel au client pour recueillir son avis. Le
          témoignage arrive dans{" "}
          <span className="text-foreground">Admin → Témoignages</span> avant
          publication sur le site.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={inviteLoading}
            onClick={() => void createInvite(false)}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-medium hover:border-gold"
          >
            {inviteLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Link2 className="h-3.5 w-3.5" />
            )}
            Générer le lien
          </button>
          <button
            type="button"
            disabled={inviteLoading}
            onClick={() => void createInvite(true)}
            className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-xs font-medium text-cream hover:bg-stone-800"
          >
            <Mail className="h-3.5 w-3.5" />
            Envoyer par email
          </button>
          {inviteLink ? (
            <button
              type="button"
              onClick={() => void copyInvite()}
              className="inline-flex items-center gap-1.5 border border-gold/30 px-3 py-2 text-xs font-medium text-gold"
            >
              {copiedInvite ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copier le lien
            </button>
          ) : null}
        </div>
        {inviteLink ? (
          <p className="break-all text-[10px] text-muted">{inviteLink}</p>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-border/70 pt-4">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
          <Share2 className="h-3.5 w-3.5" />
          Partage réseaux sociaux
        </p>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={shareEnabled}
            onChange={(e) => onShareEnabledChange(e.target.checked)}
            disabled={!canShare}
            className="mt-0.5 h-4 w-4 accent-gold"
          />
          <span>
            <span className="font-medium text-foreground">
              Autoriser le partage public de cet événement
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              {canShare
                ? "Crée une page publique partageable (événements confirmés ou terminés)."
                : "Disponible quand le statut est Confirmé ou Terminé."}
            </span>
          </span>
        </label>

        {shareEnabled && share ? (
          <div className="space-y-2 border border-border bg-surface/60 p-3">
            <p className="break-all text-[10px] text-muted">{share.url}</p>
            <EventShareButtons
              url={share.url}
              shareText={share.shareText}
              links={share.links}
              compact
            />
          </div>
        ) : shareEnabled && !share ? (
          <p className="text-xs text-muted">
            Enregistrez le dossier pour activer la page publique.
          </p>
        ) : null}
      </div>
    </div>
  );
}
