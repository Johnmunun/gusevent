import type { EmployeeContractType, EmployeeStatus } from "@prisma/client";

export type HrEmployee = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string;
  department: string | null;
  contractType: EmployeeContractType;
  status: EmployeeStatus;
  baseSalary: number | null;
  hireDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HrStats = {
  total: number;
  active: number;
  onLeave: number;
  inactive: number;
};

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  ON_LEAVE: "En congé",
};

export const EMPLOYEE_CONTRACT_LABELS: Record<EmployeeContractType, string> = {
  CDI: "CDI",
  CDD: "CDD",
  FREELANCE: "Freelance",
  INTERN: "Stage",
};

export const EMPLOYEE_DEPARTMENTS = [
  "Production",
  "Commercial",
  "Logistique",
  "Direction",
  "Autre",
] as const;

export const EMPLOYEE_STATUS_STYLES: Record<EmployeeStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  ON_LEAVE: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  INACTIVE: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
};
