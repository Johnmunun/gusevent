import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getContactSettings,
  saveContactSettings,
} from "@/lib/settings/contact-settings";

const contactSchema = z.object({
  email: z.string().email().max(200).optional(),
  phone: z.string().min(6).max(40).optional(),
  phoneDisplay: z.string().max(40).optional(),
  whatsapp: z.string().max(40).optional(),
  addressLine1: z.string().max(120).optional(),
  addressLine2: z.string().max(200).optional(),
  instagram: z.string().max(300).optional(),
  linkedin: z.string().max(300).optional(),
  facebook: z.string().max(300).optional(),
});

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.settings);
  if (guard.error) return guard.error;

  const settings = await getContactSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.settings);
  if (guard.error) return guard.error;

  const body = await request.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const saved = await saveContactSettings(parsed.data);

  revalidatePath("/", "layout");
  revalidatePath("/");

  return NextResponse.json({ settings: saved });
}
