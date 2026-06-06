import { z } from "zod";
import { EMPLOYEE_DEPARTMENTS } from "@/lib/hr/types";

const contractTypes = ["CDI", "CDD", "FREELANCE", "INTERN"] as const;
const statuses = ["ACTIVE", "INACTIVE", "ON_LEAVE"] as const;

export const employeeInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z
    .string()
    .trim()
    .email()
    .max(200)
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  jobTitle: z.string().trim().min(2).max(120),
  department: z
    .string()
    .trim()
    .max(80)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || (EMPLOYEE_DEPARTMENTS as readonly string[]).includes(v),
      "Département invalide"
    ),
  contractType: z.enum(contractTypes).optional(),
  status: z.enum(statuses).optional(),
  hireDate: z.string().trim().max(30).optional().or(z.literal("")),
  baseSalary: z.number().min(0).max(1_000_000).optional().nullable(),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type EmployeeInput = z.infer<typeof employeeInputSchema>;
