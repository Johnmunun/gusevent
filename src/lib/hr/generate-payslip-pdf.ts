import PDFDocument from "pdfkit";
import { formatTnd, type PayslipPdfData } from "@/lib/hr/payroll-types";

const INK = "#0a0908";
const GOLD = "#c9a962";
const MUTED = "#6b6560";
const BORDER = "#e5e0d8";
const MARGIN = 48;

function money(amount: number, currency: string) {
  return formatTnd(amount, currency);
}

export function generatePayslipPdf(data: PayslipPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const w = doc.page.width - MARGIN * 2;
    let y = MARGIN;

    doc.save().rect(MARGIN, y, w, 72).fill(INK).restore();
    doc
      .fillColor(GOLD)
      .fontSize(10)
      .text("BULLETIN DE PAIE", MARGIN + 20, y + 18);
    doc
      .fillColor("#fafaf9")
      .fontSize(18)
      .text(data.companyName, MARGIN + 20, y + 34, { width: w - 40 });
    doc
      .fillColor("#a8a29e")
      .fontSize(9)
      .text(data.companyAddress, MARGIN + 20, y + 56, { width: w - 40 });

    y += 88;

    doc.fillColor(MUTED).fontSize(9).text(`Réf. ${data.reference}`, MARGIN, y);
    doc.text(`Période : ${data.periodLabel}`, MARGIN, y, {
      width: w,
      align: "right",
    });
    doc.text(`Émis le ${data.issuedAt}`, MARGIN, y + 14);
    doc.text(`Statut : ${data.statusLabel}`, MARGIN, y + 14, {
      width: w,
      align: "right",
    });

    y += 40;

    doc.fillColor(INK).fontSize(12).text("Salarié", MARGIN, y);
    y += 18;
    doc.fontSize(11).text(data.employeeName, MARGIN, y);
    y += 16;
    doc.fillColor(MUTED).fontSize(10).text(data.employeeJobTitle, MARGIN, y);
    if (data.employeeDepartment) {
      y += 14;
      doc.text(data.employeeDepartment, MARGIN, y);
    }

    y += 28;

    const rowH = 28;
    const colLabel = MARGIN;
    const colValue = MARGIN + w * 0.55;

    const lines: [string, string][] = [
      ["Salaire brut", money(data.grossSalary, data.currency)],
      ["Primes & indemnités", money(data.allowances, data.currency)],
      ["Retenues", `- ${money(data.deductions, data.currency)}`],
    ];

    doc.save().rect(MARGIN, y, w, rowH).fill("#f7f5f0").restore();
    doc
      .fillColor(MUTED)
      .fontSize(9)
      .text("Éléments de rémunération", colLabel + 12, y + 9);

    y += rowH;

    for (const [label, value] of lines) {
      doc.save().rect(MARGIN, y, w, rowH).strokeColor(BORDER).stroke().restore();
      doc.fillColor(INK).fontSize(10).text(label, colLabel + 12, y + 9);
      doc.text(value, colValue, y + 9, { width: w * 0.4, align: "right" });
      y += rowH;
    }

    doc.save().rect(MARGIN, y, w, rowH + 4).fill(INK).restore();
    doc
      .fillColor(GOLD)
      .fontSize(11)
      .text("Net à payer", colLabel + 12, y + 11);
    doc
      .fillColor("#fafaf9")
      .fontSize(12)
      .text(money(data.netSalary, data.currency), colValue, y + 10, {
        width: w * 0.4,
        align: "right",
      });

    y += rowH + 24;

    if (data.notes?.trim()) {
      doc.fillColor(MUTED).fontSize(9).text("Notes", MARGIN, y);
      y += 14;
      doc.fillColor(INK).fontSize(10).text(data.notes, MARGIN, y, { width: w });
    }

    doc
      .fillColor(MUTED)
      .fontSize(8)
      .text(
        "Document interne gusEvent — bulletin de paie généré automatiquement.",
        MARGIN,
        doc.page.height - MARGIN - 10,
        { width: w, align: "center" }
      );

    doc.end();
  });
}
