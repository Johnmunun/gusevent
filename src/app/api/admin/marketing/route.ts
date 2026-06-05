import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getMarketingData } from "@/lib/growth/service";

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.marketing);
  if (guard.error) return guard.error;

  const data = await getMarketingData();
  return NextResponse.json(data);
}
