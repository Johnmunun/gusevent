import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getHrPayrollSettings } from "@/lib/settings/hr-settings";

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.hr);
  if (guard.error) return guard.error;

  const settings = await getHrPayrollSettings();
  return NextResponse.json(settings);
}
