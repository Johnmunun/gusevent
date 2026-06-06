import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  deletePayslip,
  getPayslipById,
  updatePayslip,
} from "@/lib/hr/payslip-service";
import { payslipInputSchema } from "@/lib/hr/payslip-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const guard = await requireApiPermission(PERMISSIONS.hr);
  if (guard.error) return guard.error;

  const { id } = await params;
  const payslip = await getPayslipById(id);
  if (!payslip) {
    return NextResponse.json({ error: "Bulletin introuvable" }, { status: 404 });
  }

  return NextResponse.json(payslip);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const guard = await requireApiPermission(PERMISSIONS.hrEdit);
  if (guard.error) return guard.error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = payslipInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const payslip = await updatePayslip(id, parsed.data);
    return NextResponse.json({ ok: true, payslip });
  } catch {
    return NextResponse.json({ error: "Bulletin introuvable" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const guard = await requireApiPermission(PERMISSIONS.hrEdit);
  if (guard.error) return guard.error;

  const { id } = await params;

  try {
    await deletePayslip(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bulletin introuvable" }, { status: 404 });
  }
}
