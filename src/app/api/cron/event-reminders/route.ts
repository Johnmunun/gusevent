import { NextResponse } from "next/server";
import { processEventReminders } from "@/lib/reminders/service";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const result = await processEventReminders();
  return NextResponse.json({ ok: true, ...result });
}
