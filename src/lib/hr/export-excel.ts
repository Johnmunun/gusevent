import ExcelJS from "exceljs";
import { brand } from "@/config/brand";
import { payrollAmountNumFmt } from "@/lib/settings/hr-settings-types";
import {
  PAYSLIP_STATUS_LABELS,
  formatPayPeriod,
  type HrPayslip,
} from "@/lib/hr/payroll-types";
import {
  EMPLOYEE_CONTRACT_LABELS,
  EMPLOYEE_STATUS_LABELS,
  type HrEmployee,
} from "@/lib/hr/types";

const COLORS = {
  ink: "FF0A0908",
  gold: "FFC9A962",
  cream: "FFF7F5F0",
  border: "FFE5E0D8",
  muted: "FF6B6560",
  rowAlt: "FFFAF8F4",
  white: "FFFFFFFF",
} as const;

type ColumnDef = {
  header: string;
  key: string;
  width: number;
  numFmt?: string;
  align?: "left" | "center" | "right";
};

async function workbookToBuffer(workbook: ExcelJS.Workbook) {
  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}

function applyTitleBlock(
  sheet: ExcelJS.Worksheet,
  options: {
    title: string;
    meta: string;
    lastCol: number;
  }
) {
  sheet.mergeCells(1, 1, 1, options.lastCol);
  sheet.mergeCells(2, 1, 2, options.lastCol);
  sheet.mergeCells(3, 1, 3, options.lastCol);

  const brandCell = sheet.getCell(1, 1);
  brandCell.value = `${brand.name} — Ressources humaines`;
  brandCell.font = {
    name: "Calibri",
    size: 16,
    bold: true,
    color: { argb: COLORS.cream },
  };
  brandCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.ink },
  };
  brandCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(1).height = 32;

  const docCell = sheet.getCell(2, 1);
  docCell.value = options.title;
  docCell.font = {
    name: "Calibri",
    size: 13,
    bold: true,
    color: { argb: COLORS.ink },
  };
  docCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.cream },
  };
  docCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(2).height = 24;

  const metaCell = sheet.getCell(3, 1);
  metaCell.value = options.meta;
  metaCell.font = { name: "Calibri", size: 10, color: { argb: COLORS.muted } };
  metaCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(3).height = 20;

  sheet.getRow(4).height = 8;

  for (let col = 1; col <= options.lastCol; col++) {
    sheet.getCell(4, col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.white },
    };
  }
}

function styleHeaderRow(sheet: ExcelJS.Worksheet, rowIndex: number, colCount: number) {
  const row = sheet.getRow(rowIndex);
  row.height = 24;

  for (let col = 1; col <= colCount; col++) {
    const cell = row.getCell(col);
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: COLORS.cream },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.ink },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "medium", color: { argb: COLORS.gold } },
      bottom: { style: "medium", color: { argb: COLORS.gold } },
      left: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } },
    };
  }
}

function styleDataCell(
  cell: ExcelJS.Cell,
  options: { alt: boolean; align?: "left" | "center" | "right" }
) {
  cell.font = { name: "Calibri", size: 10, color: { argb: COLORS.ink } };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: options.alt ? COLORS.rowAlt : COLORS.white },
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: options.align ?? "left",
    wrapText: true,
  };
  cell.border = {
    top: { style: "thin", color: { argb: COLORS.border } },
    bottom: { style: "thin", color: { argb: COLORS.border } },
    left: { style: "thin", color: { argb: COLORS.border } },
    right: { style: "thin", color: { argb: COLORS.border } },
  };
}

function formatDateFr(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR");
}

function exportStamp() {
  return new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setupSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  columns: ColumnDef[],
  block: { title: string; meta: string }
) {
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 5, activeCell: "A6" }],
    properties: { defaultRowHeight: 18 },
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.6,
        bottom: 0.6,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  columns.forEach((col, index) => {
    sheet.getColumn(index + 1).width = col.width;
  });

  applyTitleBlock(sheet, {
    title: block.title,
    meta: block.meta,
    lastCol: columns.length,
  });

  const headerRowIndex = 5;
  const headerRow = sheet.getRow(headerRowIndex);
  columns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
  });
  styleHeaderRow(sheet, headerRowIndex, columns.length);

  sheet.autoFilter = {
    from: { row: headerRowIndex, column: 1 },
    to: { row: headerRowIndex, column: columns.length },
  };

  return { sheet, headerRowIndex, columns };
}

export async function exportEmployeesWorkbook(
  employees: HrEmployee[],
  defaultCurrency = "TND"
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = brand.name;
  workbook.created = new Date();

  const columnDefs: ColumnDef[] = [
    { header: "N°", key: "index", width: 6, align: "center" },
    { header: "Nom complet", key: "fullName", width: 26 },
    { header: "Email", key: "email", width: 30 },
    { header: "Téléphone", key: "phone", width: 16 },
    { header: "Poste", key: "jobTitle", width: 24 },
    { header: "Département", key: "department", width: 14 },
    { header: "Contrat", key: "contract", width: 12, align: "center" },
    { header: "Statut", key: "status", width: 12, align: "center" },
    {
      header: `Salaire base (${defaultCurrency})`,
      key: "baseSalary",
      width: 18,
      numFmt: payrollAmountNumFmt(defaultCurrency),
      align: "right",
    },
    { header: "Date embauche", key: "hireDate", width: 14, align: "center" },
    { header: "Notes", key: "notes", width: 32 },
  ];

  const { sheet, headerRowIndex, columns } = setupSheet(
    workbook,
    "Employés",
    columnDefs,
    {
      title: "LISTE DES EMPLOYÉS",
      meta: `Exporté le ${exportStamp()} · ${employees.length} collaborateur${employees.length > 1 ? "s" : ""}`,
    }
  );

  employees.forEach((employee, index) => {
    const rowIndex = headerRowIndex + 1 + index;
    const row = sheet.getRow(rowIndex);
    row.height = 20;

    const values: Record<string, string | number> = {
      index: index + 1,
      fullName: employee.fullName,
      email: employee.email ?? "",
      phone: employee.phone ?? "",
      jobTitle: employee.jobTitle,
      department: employee.department ?? "",
      contract: EMPLOYEE_CONTRACT_LABELS[employee.contractType],
      status: EMPLOYEE_STATUS_LABELS[employee.status],
      baseSalary: employee.baseSalary ?? "",
      hireDate: formatDateFr(employee.hireDate),
      notes: employee.notes ?? "",
    };

    columns.forEach((col, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = values[col.key];
      if (col.numFmt && typeof values[col.key] === "number") {
        cell.numFmt = col.numFmt;
      }
      styleDataCell(cell, {
        alt: index % 2 === 1,
        align: col.align,
      });
    });
  });

  return workbookToBuffer(workbook);
}

export async function exportPayslipsWorkbook(
  payslips: HrPayslip[],
  periodLabel?: string,
  defaultCurrency = "TND"
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = brand.name;
  workbook.created = new Date();

  const totalGross = payslips.reduce((s, p) => s + p.grossSalary, 0);
  const totalAllowances = payslips.reduce((s, p) => s + p.allowances, 0);
  const totalDeductions = payslips.reduce((s, p) => s + p.deductions, 0);
  const totalNet = payslips.reduce((s, p) => s + p.netSalary, 0);

  const columnDefs: ColumnDef[] = [
    { header: "Référence", key: "reference", width: 16, align: "center" },
    { header: "Employé", key: "employeeName", width: 24 },
    { header: "Poste", key: "jobTitle", width: 22 },
    { header: "Département", key: "department", width: 14 },
    { header: "Période", key: "period", width: 14, align: "center" },
    { header: "Devise", key: "currency", width: 10, align: "center" },
    {
      header: "Salaire brut",
      key: "gross",
      width: 14,
      align: "right",
    },
    {
      header: "Primes",
      key: "allowances",
      width: 12,
      align: "right",
    },
    {
      header: "Retenues",
      key: "deductions",
      width: 12,
      align: "right",
    },
    {
      header: "Net à payer",
      key: "net",
      width: 14,
      align: "right",
    },
    { header: "Statut", key: "status", width: 12, align: "center" },
    { header: "Date paiement", key: "paidAt", width: 14, align: "center" },
    { header: "Notes", key: "notes", width: 28 },
  ];

  const periodMeta = periodLabel ? ` · Période : ${periodLabel}` : "";

  const { sheet, headerRowIndex, columns } = setupSheet(
    workbook,
    "Bulletins de paie",
    columnDefs,
    {
      title: "JOURNAL DE PAIE",
      meta: `Exporté le ${exportStamp()} · ${payslips.length} bulletin${payslips.length > 1 ? "s" : ""}${periodMeta}`,
    }
  );

  payslips.forEach((payslip, index) => {
    const rowIndex = headerRowIndex + 1 + index;
    const row = sheet.getRow(rowIndex);
    row.height = 20;

    const values: Record<string, string | number> = {
      reference: payslip.reference,
      employeeName: payslip.employeeName,
      jobTitle: payslip.employeeJobTitle,
      department: payslip.employeeDepartment ?? "",
      period: payslip.periodLabel,
      currency: payslip.currency,
      gross: payslip.grossSalary,
      allowances: payslip.allowances,
      deductions: payslip.deductions,
      net: payslip.netSalary,
      status: PAYSLIP_STATUS_LABELS[payslip.status],
      paidAt: formatDateFr(payslip.paidAt),
      notes: payslip.notes ?? "",
    };

    columns.forEach((col, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = values[col.key];
      const rowCurrency = payslip.currency || defaultCurrency;
      if (
        typeof values[col.key] === "number" &&
        ["gross", "allowances", "deductions", "net"].includes(col.key)
      ) {
        cell.numFmt = payrollAmountNumFmt(rowCurrency);
      } else if (col.numFmt && typeof values[col.key] === "number") {
        cell.numFmt = col.numFmt;
      }
      styleDataCell(cell, {
        alt: index % 2 === 1,
        align: col.align,
      });
    });
  });

  if (payslips.length > 0) {
    const totalRowIndex = headerRowIndex + 1 + payslips.length + 1;
    sheet.mergeCells(totalRowIndex, 1, totalRowIndex, 6);

    const labelCell = sheet.getCell(totalRowIndex, 1);
    labelCell.value = `TOTAUX (${defaultCurrency})`;
    labelCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.ink } };
    labelCell.alignment = { vertical: "middle", horizontal: "right" };

    for (let col = 1; col <= columns.length; col++) {
      const cell = sheet.getCell(totalRowIndex, col);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.cream },
      };
      cell.border = {
        top: { style: "medium", color: { argb: COLORS.gold } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
    }

    const amountCells: [number, number][] = [
      [7, totalGross],
      [8, totalAllowances],
      [9, totalDeductions],
      [10, totalNet],
    ];

    for (const [col, value] of amountCells) {
      const cell = sheet.getCell(totalRowIndex, col);
      cell.value = value;
      cell.numFmt = payrollAmountNumFmt(defaultCurrency);
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.ink } };
      cell.alignment = { vertical: "middle", horizontal: "right" };
    }
  }

  return workbookToBuffer(workbook);
}

export function payslipPeriodLabel(year?: number, month?: number) {
  if (!year || !month) return undefined;
  return formatPayPeriod(year, month);
}
