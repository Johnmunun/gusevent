import { NextResponse } from "next/server";
import type { PayslipStatus } from "@prisma/client";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { exportPayslipsWorkbook, payslipPeriodLabel } from "@/lib/hr/export-excel";
import { listPayslips } from "@/lib/hr/payslip-service";
import { getHrPayrollSettings } from "@/lib/settings/hr-settings";

const statuses = ["DRAFT", "VALIDATED", "PAID"] as const;

export async function GET(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.hr);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const statusParam = searchParams.get("status");

  const yearNum = year ? Number.parseInt(year, 10) : undefined;
  const monthNum = month ? Number.parseInt(month, 10) : undefined;

  const [{ payslips }, payrollSettings] = await Promise.all([
    listPayslips({
      year: yearNum,
      month: monthNum,
      status:
        statusParam && (statuses as readonly string[]).includes(statusParam)
          ? (statusParam as PayslipStatus)
          : undefined,
    }),
    getHrPayrollSettings(),
  ]);

  const buffer = await exportPayslipsWorkbook(
    payslips,
    payslipPeriodLabel(yearNum, monthNum),
    payrollSettings.defaultCurrency
  );
  const suffix =
    year && month
      ? `${year}-${String(month).padStart(2, "0")}`
      : new Date().toISOString().slice(0, 7);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="paie-gusevent-${suffix}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
