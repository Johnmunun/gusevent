import { contact } from "@/config/contact";
import { brand } from "@/config/brand";
import { prisma } from "@/lib/prisma";

export const EMAIL_SETTINGS_KEY = "email_config";

export type EmailSettings = {
  enabled: boolean;
  fromName: string;
  fromAddress: string;
  adminNotifyTo: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  clientSubject: string;
  clientBody: string;
  adminSubject: string;
  adminBody: string;
};

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  enabled: false,
  fromName: brand.name,
  fromAddress: contact.email,
  adminNotifyTo: contact.email,
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: "",
  smtpPassword: "",
  clientSubject: "Confirmation de votre demande de devis — {{reference}}",
  clientBody: `Bonjour {{fullName}},

Nous avons bien reçu votre demande de devis (réf. {{reference}}).

Récapitulatif :
- Type d'événement : {{eventType}}
- Date souhaitée : {{eventDate}}
- Budget : {{budgetLabel}}
- Lieu : {{location}}

Notre équipe vous recontactera très rapidement.

Pour modifier votre demande (budget, date, détails) :
{{modifyLink}}

Cordialement,
L'équipe {{brandName}}`,
  adminSubject: "[Nouveau devis] {{fullName}} — {{eventType}}",
  adminBody: `Nouvelle demande de devis reçue.

Référence : {{reference}}
Nom : {{fullName}}
Email : {{email}}
Téléphone : {{phone}}
Société : {{company}}
Type : {{eventType}}
Date : {{eventDate}}
Invités : {{guestCount}}
Budget : {{budgetLabel}}
Lieu : {{location}}

Message :
{{message}}

Voir dans le panneau : {{adminLink}}`,
};

export function maskEmailSettings(settings: EmailSettings): EmailSettings {
  return {
    ...settings,
    smtpPassword: settings.smtpPassword ? "••••••••" : "",
  };
}

export function mergeEmailSettings(
  stored: Partial<EmailSettings> | null | undefined
): EmailSettings {
  return { ...DEFAULT_EMAIL_SETTINGS, ...stored };
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const row = await prisma.siteSettings.findUnique({
    where: { key: EMAIL_SETTINGS_KEY },
  });

  if (!row?.value) {
    return applyEnvFallback(DEFAULT_EMAIL_SETTINGS);
  }

  try {
    const parsed = JSON.parse(row.value) as Partial<EmailSettings>;
    return applyEnvFallback(mergeEmailSettings(parsed));
  } catch {
    return applyEnvFallback(DEFAULT_EMAIL_SETTINGS);
  }
}

function applyEnvFallback(settings: EmailSettings): EmailSettings {
  return {
    ...settings,
    smtpHost: settings.smtpHost || process.env.SMTP_HOST || "",
    smtpPort: settings.smtpPort || Number(process.env.SMTP_PORT || 587),
    smtpUser: settings.smtpUser || process.env.SMTP_USER || "",
    smtpPassword: settings.smtpPassword || process.env.SMTP_PASS || "",
    fromAddress: settings.fromAddress || process.env.EMAIL_FROM || contact.email,
    adminNotifyTo:
      settings.adminNotifyTo || process.env.EMAIL_ADMIN_TO || contact.email,
    enabled:
      settings.enabled ||
      Boolean(
        (settings.smtpHost || process.env.SMTP_HOST) &&
          (settings.smtpUser || process.env.SMTP_USER)
      ),
  };
}

export async function saveEmailSettings(
  input: Partial<EmailSettings>
): Promise<EmailSettings> {
  const current = await getEmailSettings();
  const next: EmailSettings = {
    ...current,
    ...input,
    smtpPassword:
      input.smtpPassword === "••••••••" || input.smtpPassword === undefined
        ? current.smtpPassword
        : input.smtpPassword,
  };

  await prisma.siteSettings.upsert({
    where: { key: EMAIL_SETTINGS_KEY },
    create: {
      key: EMAIL_SETTINGS_KEY,
      value: JSON.stringify(next),
    },
    update: {
      value: JSON.stringify(next),
    },
  });

  return next;
}
