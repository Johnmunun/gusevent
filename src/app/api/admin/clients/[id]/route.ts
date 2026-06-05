import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  CLIENT_TO_QUOTE_STATUS,
  QUOTE_TO_CLIENT_STATUS,
} from "@/lib/clients/config";
import type { ClientStatus } from "@/data/admin-mock";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  status: z.enum(["prospect", "devis", "confirme", "termine"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiPermission(PERMISSIONS.clientsEdit);
  if (guard.error) return guard.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const quote = await prisma.quoteRequest.findUnique({ where: { id } });
  if (!quote) {
    return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }

  const updated = await prisma.quoteRequest.update({
    where: { id },
    data: { status: CLIENT_TO_QUOTE_STATUS[parsed.data.status as ClientStatus] },
  });

  return NextResponse.json({
    ok: true,
    status: QUOTE_TO_CLIENT_STATUS[updated.status],
    quoteStatus: updated.status,
  });
}
