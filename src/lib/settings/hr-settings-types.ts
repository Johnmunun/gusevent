import {
  currencies,
  DEFAULT_CURRENCY,
  type CurrencyCode,
} from "@/lib/quote";

export type HrPayrollSettings = {
  defaultCurrency: CurrencyCode;
  /** 1 unité de la devise = X unités de la devise par défaut */
  exchangeRates: Partial<Record<CurrencyCode, number>>;
};

export const DEFAULT_HR_PAYROLL_SETTINGS: HrPayrollSettings = {
  defaultCurrency: DEFAULT_CURRENCY,
  exchangeRates: {
    TND: 1,
    EUR: 3.35,
    USD: 3.1,
    GBP: 3.95,
    MAD: 0.31,
  },
};

export function getCurrencyMeta(code: string) {
  return (
    currencies.find((c) => c.code === code) ?? {
      code: DEFAULT_CURRENCY,
      label: "Dinar tunisien",
      symbol: "DT",
    }
  );
}

export function mergeHrPayrollSettings(
  stored: Partial<HrPayrollSettings> | null | undefined
): HrPayrollSettings {
  const defaultCurrency =
    stored?.defaultCurrency &&
    currencies.some((c) => c.code === stored.defaultCurrency)
      ? stored.defaultCurrency
      : DEFAULT_HR_PAYROLL_SETTINGS.defaultCurrency;

  const exchangeRates: Partial<Record<CurrencyCode, number>> = {
    ...DEFAULT_HR_PAYROLL_SETTINGS.exchangeRates,
    ...stored?.exchangeRates,
  };

  exchangeRates[defaultCurrency] = 1;

  return { defaultCurrency, exchangeRates };
}

export function formatPayrollAmount(amount: number, currency: string) {
  const { symbol, code } = getCurrencyMeta(currency);
  const formatted = amount.toLocaleString("fr-FR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  return `${formatted} ${symbol !== code ? symbol : code}`;
}

export function payrollAmountNumFmt(currency: string) {
  const { code } = getCurrencyMeta(currency);
  return `#,##0.000 "${code}"`;
}

export function convertPayrollAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  settings: HrPayrollSettings
) {
  if (from === to) return amount;

  const fromRate = settings.exchangeRates[from] ?? 1;
  const toRate = settings.exchangeRates[to] ?? 1;
  const inDefault = amount * fromRate;
  return Math.round((inDefault / toRate) * 1000) / 1000;
}
