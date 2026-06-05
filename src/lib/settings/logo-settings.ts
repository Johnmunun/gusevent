import { prisma } from "@/lib/prisma";
import {
  DEFAULT_LOGO_SETTINGS,
  mergeLogoSettings,
  type LogoSettings,
} from "@/lib/settings/logo-types";

export const LOGO_SETTINGS_KEY = "logo_config";

export type { LogoSettings } from "@/lib/settings/logo-types";
export {
  DEFAULT_LOGO_CHAIN,
  DEFAULT_LOGO_SETTINGS,
} from "@/lib/settings/logo-types";

export async function getLogoSettings(): Promise<LogoSettings> {
  const row = await prisma.siteSettings.findUnique({
    where: { key: LOGO_SETTINGS_KEY },
  });

  if (!row?.value) {
    return DEFAULT_LOGO_SETTINGS;
  }

  try {
    const parsed = JSON.parse(row.value) as Partial<LogoSettings>;
    return mergeLogoSettings(parsed);
  } catch {
    return DEFAULT_LOGO_SETTINGS;
  }
}

export async function saveLogoSettings(
  input: Partial<LogoSettings>
): Promise<LogoSettings> {
  const current = await getLogoSettings();
  const next = mergeLogoSettings({ ...current, ...input });

  await prisma.siteSettings.upsert({
    where: { key: LOGO_SETTINGS_KEY },
    create: {
      key: LOGO_SETTINGS_KEY,
      value: JSON.stringify(next),
    },
    update: {
      value: JSON.stringify(next),
    },
  });

  return next;
}
