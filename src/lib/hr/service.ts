import type { Employee, EmployeeStatus, Prisma } from "@prisma/client";
import type { HrEmployee, HrStats } from "@/lib/hr/types";
import type { EmployeeInput } from "@/lib/hr/validation";
import { prisma } from "@/lib/prisma";

function toHrEmployee(row: Employee): HrEmployee {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    jobTitle: row.jobTitle,
    department: row.department,
    contractType: row.contractType,
    status: row.status,
    baseSalary: row.baseSalary,
    hireDate: row.hireDate?.toISOString() ?? null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function parseHireDate(value?: string) {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toEmployeeData(input: EmployeeInput): Prisma.EmployeeCreateInput {
  return {
    fullName: input.fullName.trim(),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    jobTitle: input.jobTitle.trim(),
    department: input.department?.trim() || null,
    contractType: input.contractType ?? "CDI",
    status: input.status ?? "ACTIVE",
    baseSalary:
      input.baseSalary === undefined || input.baseSalary === null
        ? null
        : input.baseSalary,
    hireDate: parseHireDate(input.hireDate),
    notes: input.notes?.trim() || null,
  };
}

export async function listEmployees(options?: {
  search?: string;
  status?: EmployeeStatus;
}): Promise<{ employees: HrEmployee[]; stats: HrStats }> {
  const where: Prisma.EmployeeWhereInput = {};

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { jobTitle: { contains: q, mode: "insensitive" } },
      { department: { contains: q, mode: "insensitive" } },
    ];
  }

  const [rows, grouped] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy: [{ status: "asc" }, { fullName: "asc" }],
    }),
    prisma.employee.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const counts = grouped.reduce(
    (acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    },
    { ACTIVE: 0, INACTIVE: 0, ON_LEAVE: 0 } as Record<EmployeeStatus, number>
  );

  const total = counts.ACTIVE + counts.INACTIVE + counts.ON_LEAVE;

  return {
    employees: rows.map(toHrEmployee),
    stats: {
      total,
      active: counts.ACTIVE,
      onLeave: counts.ON_LEAVE,
      inactive: counts.INACTIVE,
    },
  };
}

export async function getEmployeeById(id: string) {
  const row = await prisma.employee.findUnique({ where: { id } });
  return row ? toHrEmployee(row) : null;
}

export async function createEmployee(input: EmployeeInput) {
  const row = await prisma.employee.create({ data: toEmployeeData(input) });
  return toHrEmployee(row);
}

export async function updateEmployee(id: string, input: EmployeeInput) {
  const row = await prisma.employee.update({
    where: { id },
    data: toEmployeeData(input),
  });
  return toHrEmployee(row);
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
}
