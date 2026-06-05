import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDashboardData } from "@/lib/dashboard/service";

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.dashboard);
  if (guard.error) return guard.error;

  const data = await getDashboardData();
  return NextResponse.json(data);
}
