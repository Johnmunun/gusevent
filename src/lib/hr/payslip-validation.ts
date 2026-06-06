import { z } from "zod";
import { currencies } from "@/lib/quote";

const payslipStatuses = ["DRAFT", "VALIDATED", "PAID"] as const;
const currencyCodes = currencies.map((c) => c.code) as [
  (typeof currencies)[number]["code"],
  ...(typeof currencies)[number]["code"][],
];

export const payslipInputSchema = z.object({
  employeeId: z.string().min(1),
  periodYear: z.number().int().min(2020).max(2100),
  periodMonth: z.number().int().min(1).max(12),
  grossSalary: z.number().min(0).max(1_000_000),
  allowances: z.number().min(0).max(1_000_000).optional(),
  deductions: z.number().min(0).max(1_000_000).optional(),
  currency: z.enum(currencyCodes).optional(),
  status: z.enum(payslipStatuses).optional(),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  markPaid: z.boolean().optional(),
});

export const payslipGenerateSchema = z.object({
  periodYear: z.number().int().min(2020).max(2100),
  periodMonth: z.number().int().min(1).max(12),
  onlyActive: z.boolean().optional(),
});

export type PayslipInput = z.infer<typeof payslipInputSchema>;

export type PayslipGenerateInput = z.infer<typeof payslipGenerateSchema>;
