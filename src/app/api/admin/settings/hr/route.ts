import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { currencies } from "@/lib/quote";
import {
  getHrPayrollSettings,
  saveHrPayrollSettings,
} from "@/lib/settings/hr-settings";

const currencyCodes = currencies.map((c) => c.code) as [
  (typeof currencies)[number]["code"],
  ...(typeof currencies)[number]["code"][],
];

const hrPayrollSchema = z.object({
  defaultCurrency: z.enum(currencyCodes),
  exchangeRates: z
    .record(z.enum(currencyCodes), z.number().positive().max(100_000))
    .optional(),
});

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.settings);
  if (guard.error) return guard.error;

  const settings = await getHrPayrollSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.settings);
  if (guard.error) return guard.error;

  const body = await request.json();
  const parsed = hrPayrollSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const saved = await saveHrPayrollSettings(parsed.data);
  return NextResponse.json({ settings: saved });
}
