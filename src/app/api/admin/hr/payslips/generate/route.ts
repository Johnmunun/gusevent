import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { generateMonthlyPayslips } from "@/lib/hr/payslip-service";
import { payslipGenerateSchema } from "@/lib/hr/payslip-validation";

export async function POST(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.hrEdit);
  if (guard.error) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = payslipGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const result = await generateMonthlyPayslips(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[admin/hr/payslips/generate] failed:", err);
    return NextResponse.json(
      { error: "Génération impossible." },
      { status: 500 }
    );
  }
}
