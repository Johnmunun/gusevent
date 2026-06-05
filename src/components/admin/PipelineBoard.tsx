"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  PIPELINE_COLUMNS,
  PIPELINE_NEXT_STATUS,
  PIPELINE_PREV_STATUS,
  PIPELINE_STATUS_LABELS,
  getPipelineProgressPercent,
  getPipelineStep,
} from "@/lib/pipeline/config";
import type { QuoteRequestStatus } from "@prisma/client";
import { useToast } from "@/components/ui/toast-context";
import { cn } from "@/lib/utils";

type PipelineCard = {
  id: string;
  reference: string;
  name: string;
  email: string;
  eventType: string;
  eventDate: string;
  budget: string;
  status: QuoteRequestStatus;
  urgent: boolean;
};

type PipelineColumn = {
  id: QuoteRequestStatus;
  title: string;
  color: string;
  cards: PipelineCard[];
};

type QuotePatchResponse = {
  id: string;
  status: QuoteRequestStatus;
  fullName: string;
  reference: string;
  eventType: string;
  budgetLabel: string;
  eventDate: string | null;
};

const PIPELINE_SEGMENT_COLORS = [
  "bg-stone-300",
  "bg-amber-300",
  "bg-emerald-400",
  "bg-gold",
] as const;

function PipelineCardProgress({ status }: { status: QuoteRequestStatus }) {
  const step = getPipelineStep(status);
  const percent = getPipelineProgressPercent(status);
  const total = PIPELINE_COLUMNS.length;

  return (
    <div className="mt-3" aria-label={`Étape ${step + 1} sur ${total}`}>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px]">
        <span className="truncate text-muted">{PIPELINE_STATUS_LABELS[status]}</span>
        <span className="shrink-0 tabular-nums text-foreground">
          {step + 1}/{total}
        </span>
      </div>
      <div className="flex gap-1" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        {PIPELINE_COLUMNS.map((col, index) => (
          <div
            key={col.id}
            className={cn(
              "h-1 flex-1 transition-colors duration-300",
              index <= step ? PIPELINE_SEGMENT_COLORS[index] : "bg-border"
            )}
            title={col.title}
          />
        ))}
      </div>
      <div className="admin-pipeline-progress-track mt-1.5 h-1 overflow-hidden bg-border">
        <motion.div
          className="admin-pipeline-progress-fill h-full bg-gold"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
}

function PipelineOverview({ columns }: { columns: PipelineColumn[] }) {
  const total = columns.reduce((sum, col) => sum + col.cards.length, 0);
  if (total === 0) return null;

  const closed = columns.find((col) => col.id === "CLOSED")?.cards.length ?? 0;
  const closedPercent = Math.round((closed / total) * 100);

  return (
    <div className="mb-6 border border-border bg-surface p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium text-foreground">Avancement global</span>
        <span className="text-muted tabular-nums">
          {closed} terminé{closed !== 1 ? "s" : ""} sur {total} · {closedPercent}%
        </span>
      </div>
      <div className="flex h-2 overflow-hidden bg-border">
        {columns.map((col, index) => {
          const width = (col.cards.length / total) * 100;
          if (width === 0) return null;
          return (
            <motion.div
              key={col.id}
              className={cn("h-full", PIPELINE_SEGMENT_COLORS[index])}
              initial={false}
              animate={{ width: `${width}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              title={`${col.title} : ${col.cards.length}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted">
        {columns.map((col, index) => (
          <span key={col.id} className="inline-flex items-center gap-1.5">
            <span
              className={cn("inline-block h-2 w-2 shrink-0", PIPELINE_SEGMENT_COLORS[index])}
              aria-hidden
            />
            {col.title} ({col.cards.length})
          </span>
        ))}
      </div>
    </div>
  );
}

function moveCardOptimistic(
  columns: PipelineColumn[],
  cardId: string,
  newStatus: QuoteRequestStatus
): PipelineColumn[] | null {
  const card = columns.flatMap((c) => c.cards).find((c) => c.id === cardId);
  if (!card || card.status === newStatus) return null;

  const updatedCard = {
    ...card,
    status: newStatus,
    urgent: newStatus === "NEW" && card.urgent,
  };

  return columns.map((col) => {
    if (col.id === card.status) {
      return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
    }
    if (col.id === newStatus) {
      return { ...col, cards: [updatedCard, ...col.cards] };
    }
    return col;
  });
}

function PipelineCardItem({
  card,
  onMove,
  moving,
}: {
  card: PipelineCard;
  onMove: (id: string, status: QuoteRequestStatus) => void;
  moving: string | null;
}) {
  const next = PIPELINE_NEXT_STATUS[card.status];
  const prev = PIPELINE_PREV_STATUS[card.status];
  const isMoving = moving === card.id;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(10,9,8,0.1)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="border border-border bg-surface p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href="/admin/devis"
          className="font-medium text-foreground hover:text-gold"
        >
          {card.name}
        </Link>
        {card.urgent && (
          <span className="shrink-0 bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-gold uppercase">
            Urgent
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[10px] text-muted">{card.reference}</p>
      <p className="mt-1 text-xs text-muted">{card.eventType}</p>
      <p className="mt-2 text-xs text-foreground">{card.budget}</p>
      <p className="mt-3 text-[10px] text-muted">{card.eventDate}</p>
      <PipelineCardProgress status={card.status} />

      <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
        {next && (
          <button
            type="button"
            disabled={isMoving}
            onClick={(e) => {
              e.stopPropagation();
              onMove(card.id, next);
            }}
            className="flex w-full items-center justify-center gap-2 bg-gold px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-gold-dark disabled:opacity-60"
          >
            {isMoving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                Avancer vers {PIPELINE_STATUS_LABELS[next]}
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
        {prev && (
          <button
            type="button"
            disabled={isMoving}
            onClick={(e) => {
              e.stopPropagation();
              onMove(card.id, prev);
            }}
            className="flex w-full items-center justify-center gap-2 border border-border px-3 py-2 text-xs text-muted transition-colors hover:border-gold hover:text-gold disabled:opacity-60"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Reculer vers {PIPELINE_STATUS_LABELS[prev]}
          </button>
        )}
      </div>
    </motion.article>
  );
}

export function PipelineBoard() {
  const { showSuccess, showError } = useToast();
  const [columns, setColumns] = useState<PipelineColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState<string | null>(null);
  const pausePollingRef = useRef(false);

  const fetchPipeline = useCallback(async () => {
    if (pausePollingRef.current) return false;
    try {
      const res = await fetch("/api/admin/pipeline", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { columns: PipelineColumn[] };
      setColumns(data.columns);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
    const interval = window.setInterval(fetchPipeline, 10000);
    return () => window.clearInterval(interval);
  }, [fetchPipeline]);

  async function moveCard(id: string, status: QuoteRequestStatus) {
    const card = columns.flatMap((c) => c.cards).find((c) => c.id === id);
    if (!card) return;

    const previousColumns = columns;
    const optimistic = moveCardOptimistic(columns, id, status);
    if (!optimistic) return;

    pausePollingRef.current = true;
    setMoving(id);
    setColumns(optimistic);

    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        setColumns(previousColumns);
        showError(
          "Déplacement refusé",
          "Session expirée ou réponse invalide. Reconnectez-vous."
        );
        return;
      }

      const data = (await res.json()) as QuotePatchResponse & { error?: string };

      if (!res.ok || !data.id || data.status !== status) {
        setColumns(previousColumns);
        const msg = data.error ?? "La mise à jour n'a pas été enregistrée.";
        showError(
          res.status === 401 ? "Session expirée" : "Déplacement impossible",
          res.status === 401 ? "Reconnectez-vous puis réessayez." : msg
        );
        return;
      }

      setColumns((prev) => moveCardOptimistic(prev, id, data.status) ?? prev);

      showSuccess(
        "Dossier déplacé",
        `${card.name} → ${PIPELINE_STATUS_LABELS[data.status]}`
      );
    } catch {
      setColumns(previousColumns);
      showError("Erreur réseau", "Le déplacement n'a pas pu être enregistré.");
    } finally {
      setMoving(null);
      window.setTimeout(() => {
        pausePollingRef.current = false;
      }, 2000);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement du pipeline…
      </p>
    );
  }

  return (
    <div>
      <PipelineOverview columns={columns} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => (
        <div
          key={col.id}
          className={cn("admin-pipeline-col border-t-4 p-4", col.color)}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
            <span className="flex h-6 min-w-6 items-center justify-center bg-ink px-1.5 text-xs font-medium text-cream tabular-nums">
              {col.cards.length}
            </span>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {col.cards.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted">Aucun dossier</p>
              ) : (
                col.cards.map((card) => (
                  <PipelineCardItem
                    key={card.id}
                    card={card}
                    onMove={moveCard}
                    moving={moving}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
