import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { processEventReminders } from "@/lib/reminders/service";

export async function POST() {
  const guard = await requireApiPermission(PERMISSIONS.dashboard);
  if (guard.error) return guard.error;

  const result = await processEventReminders();
  return NextResponse.json({ ok: true, ...result });
}
