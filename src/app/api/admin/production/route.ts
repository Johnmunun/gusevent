import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getProductionData } from "@/lib/production/service";

export async function GET(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.dashboard);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year") || 0) || undefined;
  const month = Number(searchParams.get("month") || 0) || undefined;

  const data = await getProductionData(year, month);
  return NextResponse.json(data);
}
