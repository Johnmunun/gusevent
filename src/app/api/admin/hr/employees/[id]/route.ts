import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  deleteEmployee,
  getEmployeeById,
  updateEmployee,
} from "@/lib/hr/service";
import { employeeInputSchema } from "@/lib/hr/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const guard = await requireApiPermission(PERMISSIONS.hr);
  if (guard.error) return guard.error;

  const { id } = await params;
  const employee = await getEmployeeById(id);
  if (!employee) {
    return NextResponse.json({ error: "Employé introuvable" }, { status: 404 });
  }

  return NextResponse.json(employee);
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

  const parsed = employeeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const employee = await updateEmployee(id, parsed.data);
    return NextResponse.json({ ok: true, employee });
  } catch {
    return NextResponse.json({ error: "Employé introuvable" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const guard = await requireApiPermission(PERMISSIONS.hrEdit);
  if (guard.error) return guard.error;

  const { id } = await params;

  try {
    await deleteEmployee(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Employé introuvable" }, { status: 404 });
  }
}
