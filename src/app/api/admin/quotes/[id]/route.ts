import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { adminQuotePatchSchema } from "@/lib/quotes/validation";
import { notifyQuoteUpdated, updateQuoteRequest } from "@/lib/quotes/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiPermission(PERMISSIONS.devis);
  if (guard.error) return guard.error;

  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({ where: { id } });
  if (!quote) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  return NextResponse.json(quote);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guardDevis = await requireApiPermission(PERMISSIONS.devis);
  const guardPipeline = await requireApiPermission(PERMISSIONS.pipeline);
  if (guardDevis.error && guardPipeline.error) {
    return guardDevis.error;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = adminQuotePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const existing = await prisma.quoteRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  const quote = await updateQuoteRequest(existing, parsed.data);

  const fieldsChanged = Object.keys(parsed.data).some(
    (key) => key !== "status"
  );
  if (fieldsChanged) {
    await notifyQuoteUpdated(quote);
  }

  return NextResponse.json(quote);
}
