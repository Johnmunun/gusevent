import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getSystemAccessData } from "@/lib/system/service";

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.users);
  if (guard.error) return guard.error;

  const data = await getSystemAccessData();
  return NextResponse.json(data);
}
