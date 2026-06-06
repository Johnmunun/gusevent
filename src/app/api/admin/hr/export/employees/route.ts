import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { exportEmployeesWorkbook } from "@/lib/hr/export-excel";
import { listEmployees } from "@/lib/hr/service";
import { getHrPayrollSettings } from "@/lib/settings/hr-settings";

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.hr);
  if (guard.error) return guard.error;

  const [{ employees }, payrollSettings] = await Promise.all([
    listEmployees(),
    getHrPayrollSettings(),
  ]);
  const buffer = await exportEmployeesWorkbook(
    employees,
    payrollSettings.defaultCurrency
  );
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="employes-gusevent-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
