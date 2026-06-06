import { prisma } from "@/lib/prisma";
import {
  DEFAULT_HR_PAYROLL_SETTINGS,
  mergeHrPayrollSettings,
  type HrPayrollSettings,
} from "@/lib/settings/hr-settings-types";

export const HR_PAYROLL_SETTINGS_KEY = "hr_payroll_config";

export type { HrPayrollSettings } from "@/lib/settings/hr-settings-types";
export {
  DEFAULT_HR_PAYROLL_SETTINGS,
  formatPayrollAmount,
  getCurrencyMeta,
  mergeHrPayrollSettings,
  payrollAmountNumFmt,
  convertPayrollAmount,
} from "@/lib/settings/hr-settings-types";

export async function getHrPayrollSettings(): Promise<HrPayrollSettings> {
  const row = await prisma.siteSettings.findUnique({
    where: { key: HR_PAYROLL_SETTINGS_KEY },
  });

  if (!row?.value) {
    return DEFAULT_HR_PAYROLL_SETTINGS;
  }

  try {
    const parsed = JSON.parse(row.value) as Partial<HrPayrollSettings>;
    return mergeHrPayrollSettings(parsed);
  } catch {
    return DEFAULT_HR_PAYROLL_SETTINGS;
  }
}

export async function saveHrPayrollSettings(
  input: Partial<HrPayrollSettings>
): Promise<HrPayrollSettings> {
  const current = await getHrPayrollSettings();
  const next = mergeHrPayrollSettings({ ...current, ...input });

  await prisma.siteSettings.upsert({
    where: { key: HR_PAYROLL_SETTINGS_KEY },
    create: {
      key: HR_PAYROLL_SETTINGS_KEY,
      value: JSON.stringify(next),
    },
    update: {
      value: JSON.stringify(next),
    },
  });

  return next;
}
