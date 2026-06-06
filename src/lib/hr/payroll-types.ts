import type { PayslipStatus } from "@prisma/client";
import { formatPayrollAmount } from "@/lib/settings/hr-settings-types";

export const MONTH_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

export function formatPayPeriod(year: number, month: number) {
  const label = MONTH_LABELS[month - 1] ?? String(month);
  return `${label} ${year}`;
}

export function computeNetSalary(
  gross: number,
  allowances: number,
  deductions: number
) {
  return (
    Math.round((gross + allowances - deductions) * 1000) / 1000
  );
}

export function formatTnd(amount: number, currency = "TND") {
  return formatPayrollAmount(amount, currency);
}

export { formatPayrollAmount };

export type HrPayslip = {
  id: string;
  reference: string;
  employeeId: string;
  employeeName: string;
  employeeJobTitle: string;
  employeeDepartment: string | null;
  periodYear: number;
  periodMonth: number;
  periodLabel: string;
  grossSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  currency: string;
  status: PayslipStatus;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PayrollStats = {
  count: number;
  totalGross: number;
  totalNet: number;
  paidCount: number;
  draftCount: number;
};

export const PAYSLIP_STATUS_LABELS: Record<PayslipStatus, string> = {
  DRAFT: "Brouillon",
  VALIDATED: "Validé",
  PAID: "Payé",
};

export const PAYSLIP_STATUS_STYLES: Record<PayslipStatus, string> = {
  DRAFT: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
  VALIDATED: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  PAID: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
};

export type PayslipPdfData = {
  reference: string;
  periodLabel: string;
  issuedAt: string;
  companyName: string;
  companyAddress: string;
  employeeName: string;
  employeeJobTitle: string;
  employeeDepartment: string | null;
  grossSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  currency: string;
  statusLabel: string;
  notes: string | null;
};
