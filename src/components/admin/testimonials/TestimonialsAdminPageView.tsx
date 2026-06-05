"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  X,
} from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { useToast } from "@/components/ui/toast-context";
import { cn } from "@/lib/utils";

type TestimonialItem = {
  id: string;
  link: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  quoteReference: string | null;
  prefillName: string | null;
  submitterName: string | null;
  text: string | null;
  image: string | null;
  submittedAt: string | null;
  inviteEmailSent: boolean;
  quote?: { eventType: string; fullName: string } | null;
};

const statusLabels = {
  PENDING: { label: "En attente", class: "bg-amber-50 text-amber-800" },
  APPROVED: { label: "Publié", class: "bg-emerald-50 text-emerald-800" },
  REJECTED: { label: "Refusé", class: "bg-stone-100 text-muted" },
};

export function TestimonialsAdminPageView() {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "PENDING" | "APPROVED">("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/testimonials", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "PENDING") {
      return item.status === "PENDING" && item.submittedAt;
    }
    return item.status === filter;
  });

  async function runAction(
    id: string,
    action: "approve" | "reject" | "resend"
  ) {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}/${action}`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        showError("Action impossible", data.error);
        return;
      }
      showSuccess(
        action === "approve"
          ? "Témoignage publié sur le site"
          : action === "reject"
            ? "Témoignage refusé"
            : "Email renvoyé"
      );
      load();
    } catch {
      showError("Erreur réseau");
    } finally {
      setActionId(null);
    }
  }

  async function copyLink(link: string, id: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showError("Copie impossible");
    }
  }

  const pendingCount = items.filter(
    (i) => i.status === "PENDING" && i.submittedAt
  ).length;

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-12 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement…
      </p>
    );
  }

  return (
    <>
      <div className="admin-welcome mb-8 flex flex-wrap items-center justify-between gap-4 px-5 py-5 text-cream sm:px-6">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
          <div>
            <p className="font-display text-xl">Témoignages clients</p>
            <p className="mt-2 text-sm text-stone-400">
              Liens envoyés aux clients, validation avant publication sur la
              landing.
            </p>
          </div>
        </div>
        {pendingCount > 0 && (
          <span className="border border-gold/35 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold">
            {pendingCount} à valider
          </span>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "Tous"],
            ["PENDING", "À valider"],
            ["APPROVED", "Publiés"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "border px-3 py-1.5 text-xs font-medium",
              filter === key
                ? "border-ink bg-ink text-cream"
                : "border-border bg-surface text-muted hover:border-gold/50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <AdminCard>
          <p className="py-12 text-center text-sm text-muted">
            Aucun témoignage dans cette catégorie. Générez un lien depuis une
            fiche devis ou un événement.
          </p>
        </AdminCard>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => {
            const st = statusLabels[item.status];
            const waitingSubmit = item.status === "PENDING" && !item.submittedAt;
            return (
              <AdminCard key={item.id} hover={false}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {item.submitterName ?? item.prefillName ?? "Client"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.quoteReference ?? "—"}
                      {item.quote ? ` · ${item.quote.eventType}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-semibold uppercase",
                      st.class
                    )}
                  >
                    {waitingSubmit ? "Lien envoyé" : st.label}
                  </span>
                </div>

                {item.text ? (
                  <blockquote className="mt-4 border-l-2 border-gold/50 pl-4 text-sm leading-relaxed text-foreground">
                    {item.text}
                  </blockquote>
                ) : (
                  <p className="mt-4 text-sm text-muted">
                    Le client n&apos;a pas encore rempli le formulaire.
                  </p>
                )}

                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt=""
                    className="mt-4 max-h-32 border border-border object-contain p-1"
                  />
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyLink(item.link, item.id)}
                    className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs hover:border-gold"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copier le lien
                  </button>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs hover:border-gold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ouvrir
                  </a>
                  {!item.submittedAt && (
                    <button
                      type="button"
                      disabled={actionId === item.id}
                      onClick={() => void runAction(item.id, "resend")}
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs hover:border-gold"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Renvoyer l&apos;email
                    </button>
                  )}
                  {item.submittedAt && item.status === "PENDING" && (
                    <>
                      <button
                        type="button"
                        disabled={actionId === item.id}
                        onClick={() => void runAction(item.id, "approve")}
                        className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-xs font-medium text-cream"
                      >
                        {actionId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Publier sur le site
                      </button>
                      <button
                        type="button"
                        disabled={actionId === item.id}
                        onClick={() => void runAction(item.id, "reject")}
                        className="inline-flex items-center gap-1.5 border border-red-200 px-3 py-2 text-xs text-red-700"
                      >
                        <X className="h-3.5 w-3.5" />
                        Refuser
                      </button>
                    </>
                  )}
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </>
  );
}
