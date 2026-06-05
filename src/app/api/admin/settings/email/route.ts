import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getEmailSettings,
  maskEmailSettings,
  saveEmailSettings,
} from "@/lib/settings/email-settings";
import { sendMail } from "@/lib/email/mailer";

const emailSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  fromName: z.string().max(120).optional(),
  fromAddress: z.string().email().optional(),
  adminNotifyTo: z.string().email().optional(),
  smtpHost: z.string().max(200).optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().max(200).optional(),
  smtpPassword: z.string().max(200).optional(),
  clientSubject: z.string().max(300).optional(),
  clientBody: z.string().max(10000).optional(),
  adminSubject: z.string().max(300).optional(),
  adminBody: z.string().max(10000).optional(),
  testTo: z.string().email().optional(),
});

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.settings);
  if (guard.error) return guard.error;

  const settings = await getEmailSettings();
  return NextResponse.json(maskEmailSettings(settings));
}

export async function PUT(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.settings);
  if (guard.error) return guard.error;

  const body = await request.json();
  const parsed = emailSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { testTo, ...settings } = parsed.data;
  const saved = await saveEmailSettings(settings);

  if (testTo) {
    const result = await sendMail(saved, {
      to: testTo,
      subject: `[Test] Configuration email ${saved.fromName}`,
      text: "Ceci est un email de test depuis le panneau admin gusEvent.",
    });

    return NextResponse.json({
      settings: maskEmailSettings(saved),
      test: result,
    });
  }

  return NextResponse.json({ settings: maskEmailSettings(saved) });
}
