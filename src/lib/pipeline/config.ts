import type { QuoteRequestStatus } from "@prisma/client";

export type PipelineColumnDef = {
  id: QuoteRequestStatus;
  title: string;
  color: string;
};

export const PIPELINE_COLUMNS: PipelineColumnDef[] = [
  { id: "NEW", title: "Prospects", color: "border-stone-300" },
  { id: "IN_PROGRESS", title: "Devis envoyé", color: "border-amber-300" },
  { id: "REPLIED", title: "Confirmés", color: "border-emerald-300" },
  { id: "CLOSED", title: "Terminés", color: "border-border" },
];

export const PIPELINE_NEXT_STATUS: Partial<
  Record<QuoteRequestStatus, QuoteRequestStatus>
> = {
  NEW: "IN_PROGRESS",
  IN_PROGRESS: "REPLIED",
  REPLIED: "CLOSED",
};

export const PIPELINE_PREV_STATUS: Partial<
  Record<QuoteRequestStatus, QuoteRequestStatus>
> = {
  IN_PROGRESS: "NEW",
  REPLIED: "IN_PROGRESS",
  CLOSED: "REPLIED",
};

export const PIPELINE_STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  NEW: "Prospects",
  IN_PROGRESS: "Devis envoyé",
  REPLIED: "Confirmés",
  CLOSED: "Terminés",
};

export const PIPELINE_STATUS_ORDER: QuoteRequestStatus[] = PIPELINE_COLUMNS.map(
  (col) => col.id
);

export function getPipelineStep(status: QuoteRequestStatus): number {
  const step = PIPELINE_STATUS_ORDER.indexOf(status);
  return step < 0 ? 0 : step;
}

export function getPipelineProgressPercent(status: QuoteRequestStatus): number {
  const step = getPipelineStep(status);
  return Math.round(((step + 1) / PIPELINE_COLUMNS.length) * 100);
}
