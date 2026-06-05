import type { QuoteRequestStatus } from "@prisma/client";
import type { ClientStatus } from "@/data/admin-mock";

export const QUOTE_TO_CLIENT_STATUS: Record<QuoteRequestStatus, ClientStatus> = {
  NEW: "prospect",
  IN_PROGRESS: "devis",
  REPLIED: "confirme",
  CLOSED: "termine",
};

export const CLIENT_TO_QUOTE_STATUS: Record<ClientStatus, QuoteRequestStatus> = {
  prospect: "NEW",
  devis: "IN_PROGRESS",
  confirme: "REPLIED",
  termine: "CLOSED",
};

export const CLIENT_FILTER_LABELS: Record<ClientStatus, string> = {
  prospect: "Prospect",
  devis: "Devis",
  confirme: "Confirmé",
  termine: "Terminé",
};
