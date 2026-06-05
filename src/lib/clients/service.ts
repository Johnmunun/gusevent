import type { QuoteRequest, QuoteRequestStatus } from "@prisma/client";
import type { ClientStatus } from "@/data/admin-mock";
import { QUOTE_TO_CLIENT_STATUS } from "@/lib/clients/config";
import { prisma } from "@/lib/prisma";

export type AdminClient = {
  id: string;
  quoteId: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  budget: string;
  status: ClientStatus;
  quoteStatus: QuoteRequestStatus;
  createdAt: string;
  priority?: "haute" | "normale";
  quotesCount: number;
};

export type AdminClientStats = {
  total: number;
  confirmed: number;
  highPriority: number;
};

const HIGH_PRIORITY_MS = 48 * 60 * 60 * 1000;

function isHighPriority(quote: QuoteRequest): boolean {
  if (quote.status !== "NEW") return false;
  return Date.now() - quote.createdAt.getTime() < HIGH_PRIORITY_MS;
}

function mapQuoteToClient(
  quote: QuoteRequest,
  quotesCount: number
): AdminClient {
  return {
    id: quote.id,
    quoteId: quote.id,
    reference: quote.reference,
    name: quote.fullName,
    email: quote.email,
    phone: quote.phone,
    eventType: quote.eventType,
    eventDate: quote.eventDate ?? "",
    budget: quote.budgetLabel,
    status: QUOTE_TO_CLIENT_STATUS[quote.status],
    quoteStatus: quote.status,
    createdAt: quote.createdAt.toISOString(),
    priority: isHighPriority(quote) ? "haute" : "normale",
    quotesCount,
  };
}

export async function listClientsFromQuotes(options?: {
  search?: string;
  status?: ClientStatus;
}): Promise<{ clients: AdminClient[]; stats: AdminClientStats }> {
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const countsByEmail = new Map<string, number>();
  for (const quote of quotes) {
    const key = quote.email.toLowerCase();
    countsByEmail.set(key, (countsByEmail.get(key) ?? 0) + 1);
  }

  const seen = new Set<string>();
  const clients: AdminClient[] = [];

  for (const quote of quotes) {
    const key = quote.email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    clients.push(mapQuoteToClient(quote, countsByEmail.get(key) ?? 1));
  }

  const search = options?.search?.trim().toLowerCase();
  const statusFilter = options?.status;

  const filtered = clients.filter((client) => {
    if (statusFilter && client.status !== statusFilter) return false;
    if (!search) return true;
    return (
      client.name.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search) ||
      client.eventType.toLowerCase().includes(search) ||
      client.reference.toLowerCase().includes(search)
    );
  });

  const stats: AdminClientStats = {
    total: clients.length,
    confirmed: clients.filter((c) => c.status === "confirme").length,
    highPriority: clients.filter((c) => c.priority === "haute").length,
  };

  return { clients: filtered, stats };
}
