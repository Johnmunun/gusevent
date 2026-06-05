import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getPortfolioData } from "@/lib/site/service";

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.portfolio);
  if (guard.error) return guard.error;

  const data = await getPortfolioData();
  return NextResponse.json(data);
}
