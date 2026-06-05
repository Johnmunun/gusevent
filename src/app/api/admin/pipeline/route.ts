import { NextResponse } from "next/server";
import type { QuoteRequestStatus } from "@prisma/client";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { PIPELINE_COLUMNS } from "@/lib/pipeline/config";
import { prisma } from "@/lib/prisma";

const URGENT_HOURS = 48;

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.pipeline);
  if (guard.error) return guard.error;

  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();

  const columns = PIPELINE_COLUMNS.map((col) => ({
    ...col,
    cards: quotes
      .filter((q) => q.status === col.id)
      .map((q) => {
        const ageHours = (now - q.createdAt.getTime()) / (1000 * 60 * 60);
        return {
          id: q.id,
          reference: q.reference,
          name: q.fullName,
          email: q.email,
          phone: q.phone,
          eventType: q.eventType,
          eventDate: q.eventDate || "À préciser",
          budget: q.budgetLabel,
          status: q.status,
          createdAt: q.createdAt.toISOString(),
          urgent: q.status === "NEW" && ageHours <= URGENT_HOURS,
        };
      }),
  }));

  return NextResponse.json({ columns });
}

export async function PATCH(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.pipeline);
  if (guard.error) return guard.error;

  const body = await request.json();
  const id = body.id as string | undefined;
  const status = body.status as QuoteRequestStatus | undefined;

  if (!id || !status) {
    return NextResponse.json({ error: "id et status requis" }, { status: 400 });
  }

  const validStatuses = PIPELINE_COLUMNS.map((c) => c.id);
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const quote = await prisma.quoteRequest.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(quote);
}
