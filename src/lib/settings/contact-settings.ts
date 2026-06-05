import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CONTACT_SETTINGS,
  mergeContactSettings,
  type ContactSettings,
} from "@/lib/settings/contact-types";

export const CONTACT_SETTINGS_KEY = "contact_config";

export type { ContactSettings } from "@/lib/settings/contact-types";
export {
  DEFAULT_CONTACT_SETTINGS,
  mailtoDevisFromEmail,
  socialLinksFromContact,
  telLinkFromPhone,
  whatsappLink,
} from "@/lib/settings/contact-types";

export async function getContactSettings(): Promise<ContactSettings> {
  const row = await prisma.siteSettings.findUnique({
    where: { key: CONTACT_SETTINGS_KEY },
  });

  if (!row?.value) {
    return DEFAULT_CONTACT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(row.value) as Partial<ContactSettings>;
    return mergeContactSettings(parsed);
  } catch {
    return DEFAULT_CONTACT_SETTINGS;
  }
}

export async function saveContactSettings(
  input: Partial<ContactSettings>
): Promise<ContactSettings> {
  const current = await getContactSettings();
  const next = mergeContactSettings({ ...current, ...input });

  await prisma.siteSettings.upsert({
    where: { key: CONTACT_SETTINGS_KEY },
    create: {
      key: CONTACT_SETTINGS_KEY,
      value: JSON.stringify(next),
    },
    update: {
      value: JSON.stringify(next),
    },
  });

  return next;
}
