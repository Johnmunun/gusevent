import { NextResponse } from "next/server";
import type { EmployeeStatus } from "@prisma/client";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createEmployee, listEmployees } from "@/lib/hr/service";
import { employeeInputSchema } from "@/lib/hr/validation";

const statuses = ["ACTIVE", "INACTIVE", "ON_LEAVE"] as const;

export async function GET(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.hr);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const statusParam = searchParams.get("status");
  const status =
    statusParam && (statuses as readonly string[]).includes(statusParam)
      ? (statusParam as EmployeeStatus)
      : undefined;

  const data = await listEmployees({ search, status });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.hrEdit);
  if (guard.error) return guard.error;

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
    const employee = await createEmployee(parsed.data);
    return NextResponse.json({ ok: true, employee });
  } catch (err) {
    console.error("[admin/hr] create failed:", err);
    return NextResponse.json(
      { error: "Impossible d'enregistrer l'employé." },
      { status: 500 }
    );
  }
}
