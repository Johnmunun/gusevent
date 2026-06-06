import type { Payslip, PayslipStatus, Prisma } from "@prisma/client";
import { getHrPayrollSettings } from "@/lib/settings/hr-settings";
import { brand } from "@/config/brand";
import { contact } from "@/config/contact";
import {
  computeNetSalary,
  formatPayPeriod,
  PAYSLIP_STATUS_LABELS,
  type HrPayslip,
  type PayrollStats,
  type PayslipPdfData,
} from "@/lib/hr/payroll-types";
import type { PayslipGenerateInput, PayslipInput } from "@/lib/hr/payslip-validation";
import { prisma } from "@/lib/prisma";

type PayslipWithEmployee = Payslip & {
  employee: {
    fullName: string;
    jobTitle: string;
    department: string | null;
  };
};

function toHrPayslip(row: PayslipWithEmployee): HrPayslip {
  return {
    id: row.id,
    reference: row.reference,
    employeeId: row.employeeId,
    employeeName: row.employee.fullName,
    employeeJobTitle: row.employee.jobTitle,
    employeeDepartment: row.employee.department,
    periodYear: row.periodYear,
    periodMonth: row.periodMonth,
    periodLabel: formatPayPeriod(row.periodYear, row.periodMonth),
    grossSalary: row.grossSalary,
    allowances: row.allowances,
    deductions: row.deductions,
    netSalary: row.netSalary,
    currency: row.currency,
    status: row.status,
    paidAt: row.paidAt?.toISOString() ?? null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function nextPayslipReference(year: number, month: number) {
  const prefix = `BP-${year}${String(month).padStart(2, "0")}`;
  const count = await prisma.payslip.count({
    where: { periodYear: year, periodMonth: month },
  });
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

function buildStats(rows: PayslipWithEmployee[]): PayrollStats {
  return rows.reduce(
    (acc, row) => {
      acc.count += 1;
      acc.totalGross += row.grossSalary;
      acc.totalNet += row.netSalary;
      if (row.status === "PAID") acc.paidCount += 1;
      if (row.status === "DRAFT") acc.draftCount += 1;
      return acc;
    },
    {
      count: 0,
      totalGross: 0,
      totalNet: 0,
      paidCount: 0,
      draftCount: 0,
    }
  );
}

export async function listPayslips(options?: {
  year?: number;
  month?: number;
  employeeId?: string;
  status?: PayslipStatus;
}) {
  const where: Prisma.PayslipWhereInput = {};

  if (options?.year) where.periodYear = options.year;
  if (options?.month) where.periodMonth = options.month;
  if (options?.employeeId) where.employeeId = options.employeeId;
  if (options?.status) where.status = options.status;

  const rows = await prisma.payslip.findMany({
    where,
    include: {
      employee: {
        select: { fullName: true, jobTitle: true, department: true },
      },
    },
    orderBy: [
      { periodYear: "desc" },
      { periodMonth: "desc" },
      { employee: { fullName: "asc" } },
    ],
  });

  const payslips = rows.map(toHrPayslip);
  return { payslips, stats: buildStats(rows) };
}

export async function getPayslipById(id: string) {
  const row = await prisma.payslip.findUnique({
    where: { id },
    include: {
      employee: {
        select: { fullName: true, jobTitle: true, department: true },
      },
    },
  });
  return row ? toHrPayslip(row) : null;
}

async function resolvePayslipCurrency(input?: string | null) {
  const settings = await getHrPayrollSettings();
  const code = input?.trim();
  return code || settings.defaultCurrency;
}

export async function createPayslip(input: PayslipInput) {
  const allowances = input.allowances ?? 0;
  const deductions = input.deductions ?? 0;
  const netSalary = computeNetSalary(
    input.grossSalary,
    allowances,
    deductions
  );
  const reference = await nextPayslipReference(
    input.periodYear,
    input.periodMonth
  );
  const currency = await resolvePayslipCurrency(input.currency);

  const row = await prisma.payslip.create({
    data: {
      reference,
      employeeId: input.employeeId,
      periodYear: input.periodYear,
      periodMonth: input.periodMonth,
      grossSalary: input.grossSalary,
      allowances,
      deductions,
      netSalary,
      currency,
      status: input.status ?? "DRAFT",
      paidAt: input.status === "PAID" || input.markPaid ? new Date() : null,
      notes: input.notes?.trim() || null,
    },
    include: {
      employee: {
        select: { fullName: true, jobTitle: true, department: true },
      },
    },
  });

  return toHrPayslip(row);
}

export async function updatePayslip(id: string, input: PayslipInput) {
  const allowances = input.allowances ?? 0;
  const deductions = input.deductions ?? 0;
  const netSalary = computeNetSalary(
    input.grossSalary,
    allowances,
    deductions
  );
  const status = input.status ?? "DRAFT";

  const existing = await prisma.payslip.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");

  let paidAt = existing.paidAt;
  if (status === "PAID" && !paidAt) paidAt = new Date();
  if (status !== "PAID") paidAt = input.markPaid ? new Date() : null;

  const currency = await resolvePayslipCurrency(input.currency);

  const row = await prisma.payslip.update({
    where: { id },
    data: {
      employeeId: input.employeeId,
      periodYear: input.periodYear,
      periodMonth: input.periodMonth,
      grossSalary: input.grossSalary,
      allowances,
      deductions,
      netSalary,
      currency,
      status,
      paidAt,
      notes: input.notes?.trim() || null,
    },
    include: {
      employee: {
        select: { fullName: true, jobTitle: true, department: true },
      },
    },
  });

  return toHrPayslip(row);
}

export async function deletePayslip(id: string) {
  await prisma.payslip.delete({ where: { id } });
}

export async function generateMonthlyPayslips(input: PayslipGenerateInput) {
  const employees = await prisma.employee.findMany({
    where: input.onlyActive === false ? undefined : { status: "ACTIVE" },
    orderBy: { fullName: "asc" },
  });

  const existing = await prisma.payslip.findMany({
    where: {
      periodYear: input.periodYear,
      periodMonth: input.periodMonth,
      employeeId: { in: employees.map((e) => e.id) },
    },
    select: { employeeId: true },
  });

  const existingIds = new Set(existing.map((e) => e.employeeId));
  const created: HrPayslip[] = [];
  const settings = await getHrPayrollSettings();

  for (const employee of employees) {
    if (existingIds.has(employee.id)) continue;

    const grossSalary = employee.baseSalary ?? 0;
    const payslip = await createPayslip({
      employeeId: employee.id,
      periodYear: input.periodYear,
      periodMonth: input.periodMonth,
      grossSalary,
      allowances: 0,
      deductions: 0,
      currency: settings.defaultCurrency,
      status: "DRAFT",
    });
    created.push(payslip);
  }

  return { createdCount: created.length, payslips: created };
}

export function buildPayslipPdfData(payslip: HrPayslip): PayslipPdfData {
  return {
    reference: payslip.reference,
    periodLabel: payslip.periodLabel,
    issuedAt: new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    companyName: brand.legalName,
    companyAddress: `${contact.address.line1}, ${contact.address.line2}`,
    employeeName: payslip.employeeName,
    employeeJobTitle: payslip.employeeJobTitle,
    employeeDepartment: payslip.employeeDepartment,
    grossSalary: payslip.grossSalary,
    allowances: payslip.allowances,
    deductions: payslip.deductions,
    netSalary: payslip.netSalary,
    currency: payslip.currency,
    statusLabel: PAYSLIP_STATUS_LABELS[payslip.status],
    notes: payslip.notes,
  };
}

export async function getPayslipPdfBuffer(id: string) {
  const payslip = await getPayslipById(id);
  if (!payslip) return null;
  const { generatePayslipPdf } = await import("@/lib/hr/generate-payslip-pdf");
  const buffer = await generatePayslipPdf(buildPayslipPdfData(payslip));
  return { buffer, filename: `${payslip.reference}.pdf` };
}
