import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { listClientsFromQuotes } from "@/lib/clients/service";
import type { ClientStatus } from "@/data/admin-mock";
import { createQuoteRequest } from "@/lib/quotes/service";
import {
  DEFAULT_BUDGET,
  DEFAULT_CURRENCY,
  DEFAULT_EVENT_TYPE,
  eventTypeOptions,
} from "@/lib/quote";

const clientStatusValues = [
  "prospect",
  "devis",
  "confirme",
  "termine",
] as const satisfies readonly ClientStatus[];

const createClientSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(40),
  eventType: z
    .string()
    .refine(
      (v): v is (typeof eventTypeOptions)[number] =>
        (eventTypeOptions as readonly string[]).includes(v),
      "Type d'événement invalide"
    )
    .optional(),
  eventDate: z.string().trim().max(30).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export async function GET(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.clients);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const statusParam = searchParams.get("status");
  const status =
    statusParam &&
    (clientStatusValues as readonly string[]).includes(statusParam)
      ? (statusParam as ClientStatus)
      : undefined;

  const { clients, stats } = await listClientsFromQuotes({ search, status });
  return NextResponse.json({ clients, stats });
}

export async function POST(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.clientsEdit);
  if (guard.error) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const quote = await createQuoteRequest({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: "",
      eventType: parsed.data.eventType ?? DEFAULT_EVENT_TYPE,
      eventDate: parsed.data.eventDate ?? "",
      guestCount: "",
      currency: DEFAULT_CURRENCY,
      budget: DEFAULT_BUDGET,
      location: "",
      message: parsed.data.notes ?? "",
    });

    return NextResponse.json({ ok: true, quoteId: quote.id, reference: quote.reference });
  } catch (err) {
    console.error("[admin/clients] create failed:", err);
    return NextResponse.json(
      { error: "Impossible d'enregistrer le client." },
      { status: 500 }
    );
  }
}
