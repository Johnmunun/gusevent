import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getCmsOverview } from "@/lib/site/service";

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.cms);
  if (guard.error) return guard.error;

  const data = await getCmsOverview();
  return NextResponse.json(data);
}
