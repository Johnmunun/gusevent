import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getLogoSettings,
  saveLogoSettings,
} from "@/lib/settings/logo-settings";

const logoSettingsSchema = z.object({
  url: z.string().max(500).optional(),
  showText: z.boolean().optional(),
});

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.settings);
  if (guard.error) return guard.error;

  const settings = await getLogoSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.settings);
  if (guard.error) return guard.error;

  const body = await request.json();
  const parsed = logoSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const saved = await saveLogoSettings(parsed.data);

  revalidatePath("/", "layout");
  revalidatePath("/");

  return NextResponse.json({ settings: saved });
}
