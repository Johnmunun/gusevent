import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getSystemSettingsData } from "@/lib/system/service";

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.settings);
  if (guard.error) return guard.error;

  const data = await getSystemSettingsData();
  return NextResponse.json(data);
}
