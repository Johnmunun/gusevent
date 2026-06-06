import { NextResponse } from "next/server";
import type { PayslipStatus } from "@prisma/client";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createPayslip, listPayslips } from "@/lib/hr/payslip-service";
import { payslipInputSchema } from "@/lib/hr/payslip-validation";

const statuses = ["DRAFT", "VALIDATED", "PAID"] as const;

export async function GET(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.hr);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const employeeId = searchParams.get("employeeId") ?? undefined;
  const statusParam = searchParams.get("status");

  const data = await listPayslips({
    year: year ? Number.parseInt(year, 10) : undefined,
    month: month ? Number.parseInt(month, 10) : undefined,
    employeeId,
    status:
      statusParam && (statuses as readonly string[]).includes(statusParam)
        ? (statusParam as PayslipStatus)
        : undefined,
  });

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

  const parsed = payslipInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const payslip = await createPayslip(parsed.data);
    return NextResponse.json({ ok: true, payslip });
  } catch (err) {
    const code =
      err instanceof Error && "code" in err
        ? String((err as { code?: string }).code)
        : "";
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Un bulletin existe déjà pour cet employé sur cette période." },
        { status: 409 }
      );
    }
    console.error("[admin/hr/payslips] create failed:", err);
    return NextResponse.json(
      { error: "Impossible de créer le bulletin." },
      { status: 500 }
    );
  }
}
