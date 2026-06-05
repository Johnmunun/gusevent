import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAnalyticsData } from "@/lib/growth/service";

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.analytics);
  if (guard.error) return guard.error;

  const data = await getAnalyticsData();
  return NextResponse.json(data);
}
