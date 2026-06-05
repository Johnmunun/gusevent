import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import type { InvoiceDocumentData } from "@/lib/invoices/build-document";
import { formatMoney } from "@/lib/invoices/build-document";

type PdfDoc = InstanceType<typeof PDFDocument>;

const INK = "#0a0908";
const INK_SOFT = "#1e1c1a";
const GOLD = "#c9a962";
const GOLD_LIGHT = "#e8d9a8";
const CREAM = "#f7f5f0";
const SURFACE = "#ffffff";
const MUTED = "#6b6560";
const BORDER = "#e5e0d8";
const ROW_ALT = "#faf8f4";

const MARGIN = 40;
const HEADER_H = 108;
const FOOTER_H = 44;

function findLogoPath(): string | null {
  const candidates = ["logo.png", "logo.jpg", "logo.jpeg"];
  for (const file of candidates) {
    const fullPath = path.join(process.cwd(), "public", "media", file);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  return null;
}

function formatDisplayDate(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime()) && value.includes("-")) {
    return parsed.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  return value;
}

function contentWidth(doc: PdfDoc): number {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function pageBottom(doc: PdfDoc): number {
  return doc.page.height - doc.page.margins.bottom;
}

function drawRect(
  doc: PdfDoc,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  radius = 0
) {
  doc.save().fillColor(fill);
  if (radius > 0) {
    doc.roundedRect(x, y, w, h, radius).fill();
  } else {
    doc.rect(x, y, w, h).fill();
  }
  doc.restore();
}

function drawLine(
  doc: PdfDoc,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = BORDER,
  width = 1
) {
  doc
    .save()
    .strokeColor(color)
    .lineWidth(width)
    .moveTo(x1, y1)
    .lineTo(x2, y2)
    .stroke()
    .restore();
}

/** Texte borné : évite les sauts de page automatiques de PDFKit. */
function boundedText(
  doc: PdfDoc,
  text: string,
  x: number,
  y: number,
  width: number,
  maxHeight: number,
  options: PDFKit.Mixins.TextOptions = {}
) {
  doc.text(text, x, y, {
    width,
    height: maxHeight,
    ellipsis: true,
    ...options,
  });
}

function drawHeader(doc: PdfDoc, data: InvoiceDocumentData): number {
  const w = contentWidth(doc);
  const left = MARGIN;

  drawRect(doc, left, MARGIN, w, HEADER_H, INK);
  drawRect(doc, left, MARGIN + HEADER_H - 4, w, 4, GOLD);

  const logoPath = findLogoPath();
  const logoSize = 52;
  let textLeft = left + 24;

  if (logoPath) {
    try {
      doc.image(logoPath, left + 24, MARGIN + 22, {
        fit: [logoSize, logoSize],
        align: "center",
        valign: "center",
      });
      textLeft = left + 24 + logoSize + 16;
    } catch {
      // ignore invalid logo
    }
  }

  doc.font("Helvetica-Bold").fontSize(16).fillColor(CREAM);
  boundedText(doc, data.issuer.name, textLeft, MARGIN + 24, w * 0.45, 20);
  doc.font("Helvetica").fontSize(8).fillColor(GOLD_LIGHT);
  boundedText(doc, data.issuer.tagline, textLeft, MARGIN + 44, w * 0.45, 12);
  boundedText(
    doc,
    `${data.issuer.address} · ${data.issuer.email} · ${data.issuer.phone}`,
    textLeft,
    MARGIN + 58,
    w * 0.5,
    28
  );

  const badgeW = 168;
  const badgeX = left + w - badgeW - 20;
  const badgeY = MARGIN + 20;

  drawRect(doc, badgeX, badgeY, badgeW, 68, INK_SOFT, 2);
  drawRect(doc, badgeX, badgeY, badgeW, 3, GOLD);

  doc.font("Helvetica-Bold").fontSize(20).fillColor(GOLD);
  boundedText(doc, data.documentTitle, badgeX, badgeY + 14, badgeW, 24, {
    align: "center",
  });
  doc.font("Helvetica").fontSize(8).fillColor(CREAM);
  boundedText(doc, data.documentNumber, badgeX, badgeY + 42, badgeW, 12, {
    align: "center",
  });

  return MARGIN + HEADER_H + 20;
}

function drawMetaCards(doc: PdfDoc, data: InvoiceDocumentData, startY: number): number {
  const w = contentWidth(doc);
  const left = MARGIN;
  const gap = 14;
  const cardW = (w - gap) / 2;
  const cardH = 118;
  const y = startY;

  const drawCard = (
    x: number,
    title: string,
    lines: { label: string; value: string; bold?: boolean }[]
  ) => {
    drawRect(doc, x, y, cardW, cardH, SURFACE, 2);
    drawLine(doc, x, y, x + cardW, y, GOLD, 2.5);
    drawRect(doc, x, y + 1, cardW, 26, CREAM);
    doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED);
    doc.text(title, x + 14, y + 9);

    let lineY = y + 34;
    for (const line of lines) {
      doc.font("Helvetica").fontSize(7).fillColor(MUTED);
      doc.text(line.label, x + 14, lineY, { width: 72, lineBreak: false });
      doc
        .font(line.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(line.bold ? 9 : 8)
        .fillColor(INK);
      boundedText(doc, line.value, x + 88, lineY, cardW - 102, line.bold ? 14 : 12);
      lineY += line.bold ? 16 : 13;
    }
  };

  drawCard(left, "FACTURÉ À", [
    { label: "Nom", value: data.client.name, bold: true },
    ...(data.client.company
      ? [{ label: "Société", value: data.client.company }]
      : []),
    { label: "Email", value: data.client.email },
    { label: "Tél.", value: data.client.phone },
  ]);

  drawCard(left + cardW + gap, "DÉTAILS DOCUMENT", [
    { label: "Date", value: formatDisplayDate(data.issuedAt.toISOString().slice(0, 10)) },
    {
      label: "Échéance",
      value: data.dueDate ? formatDisplayDate(data.dueDate) : "À réception",
    },
    { label: "Réf.", value: data.quoteReference },
    { label: "Devise", value: data.currency, bold: true },
  ]);

  return y + cardH + 16;
}

function drawProjectBanner(doc: PdfDoc, data: InvoiceDocumentData, startY: number): number {
  const w = contentWidth(doc);
  const left = MARGIN;
  const h = 52;
  const y = startY;

  drawRect(doc, left, y, w, h, CREAM, 2);
  drawRect(doc, left, y, 4, h, GOLD);

  doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED);
  doc.text("OBJET DE LA PRESTATION", left + 16, y + 10);

  doc.font("Helvetica-Bold").fontSize(10).fillColor(INK);
  boundedText(doc, data.project.eventType, left + 16, y + 24, w * 0.28, 22);

  const detailCols = [
    { label: "DATE ÉVÉNEMENT", value: formatDisplayDate(data.project.eventDate) },
    { label: "INVITÉS", value: data.project.guestCount || "—" },
    { label: "LIEU", value: data.project.location || "À préciser" },
    { label: "BUDGET CIBLE", value: data.project.budgetLabel },
  ];

  const detailStart = left + w * 0.3;
  const detailW = (w * 0.7) / detailCols.length;
  detailCols.forEach((col, i) => {
    const colX = detailStart + i * detailW;
    doc.font("Helvetica").fontSize(6).fillColor(MUTED);
    doc.text(col.label, colX, y + 10, { width: detailW - 6, lineBreak: false });
    doc.font("Helvetica-Bold").fontSize(8).fillColor(INK);
    boundedText(doc, col.value, colX, y + 22, detailW - 6, 22);
  });

  return y + h + 18;
}

function measureRowHeight(
  doc: PdfDoc,
  description: string,
  colDescW: number,
  minH: number
): number {
  doc.font("Helvetica").fontSize(9);
  const textH = doc.heightOfString(description, { width: colDescW - 20 });
  return Math.max(minH, textH + 14);
}

function drawLineItemsTable(
  doc: PdfDoc,
  data: InvoiceDocumentData,
  startY: number
): number {
  const w = contentWidth(doc);
  const left = MARGIN;
  let y = startY;
  const bottom = pageBottom(doc);

  const colDescW = w * 0.46;
  const colQtyW = w * 0.1;
  const colUnitW = w * 0.18;
  const colTotalW = w * 0.18;
  const colQtyX = left + colDescW;
  const colUnitX = colQtyX + colQtyW;
  const colTotalX = colUnitX + colUnitW;
  const headerH = 28;

  drawRect(doc, left, y, w, headerH, INK, 2);
  doc.font("Helvetica-Bold").fontSize(7).fillColor(GOLD);
  doc.text("DESCRIPTION", left + 14, y + 10, { width: colDescW - 20, lineBreak: false });
  doc.text("QTÉ", colQtyX, y + 10, { width: colQtyW - 8, align: "center", lineBreak: false });
  doc.text("PRIX UNIT. HT", colUnitX, y + 10, {
    width: colUnitW - 8,
    align: "right",
    lineBreak: false,
  });
  doc.text("MONTANT HT", colTotalX, y + 10, {
    width: colTotalW - 14,
    align: "right",
    lineBreak: false,
  });
  y += headerH;

  for (const [index, item] of data.lineItems.entries()) {
    const lineTotal = item.quantity * item.unitPrice;
    const rowH = measureRowHeight(doc, item.description, colDescW, 32);

    if (y + rowH > bottom - FOOTER_H - 80) {
      doc.addPage();
      y = doc.page.margins.top;
    }

    if (index % 2 === 0) {
      drawRect(doc, left, y, w, rowH, ROW_ALT);
    }
    drawLine(doc, left, y + rowH, left + w, y + rowH, BORDER, 0.5);

    doc.font("Helvetica").fontSize(9).fillColor(INK);
    boundedText(doc, item.description, left + 14, y + 10, colDescW - 20, rowH - 12);
    doc.text(String(item.quantity), colQtyX, y + 10, {
      width: colQtyW - 8,
      align: "center",
      lineBreak: false,
    });
    doc.text(formatMoney(item.unitPrice, data.currencySymbol), colUnitX, y + 10, {
      width: colUnitW - 8,
      align: "right",
      lineBreak: false,
    });
    doc
      .font("Helvetica-Bold")
      .text(formatMoney(lineTotal, data.currencySymbol), colTotalX, y + 10, {
        width: colTotalW - 14,
        align: "right",
        lineBreak: false,
      });
    doc.font("Helvetica");

    y += rowH;
  }

  drawLine(doc, left, y, left + w, y, INK, 1);
  return y + 16;
}

function drawTotalsBlock(doc: PdfDoc, data: InvoiceDocumentData, startY: number): number {
  const w = contentWidth(doc);
  const left = MARGIN;
  const boxW = 248;
  const boxX = left + w - boxW;
  const y = startY;

  const rows: { label: string; value: string }[] = [
    {
      label: "Sous-total HT",
      value: formatMoney(data.subtotal, data.currencySymbol),
    },
  ];
  if (data.taxRate > 0) {
    rows.push({
      label: `TVA (${data.taxRate} %)`,
      value: formatMoney(data.taxAmount, data.currencySymbol),
    });
  }

  const boxH = 24 + rows.length * 22 + 52;
  drawRect(doc, boxX, y, boxW, boxH, SURFACE, 2);
  drawLine(doc, boxX, y, boxX + boxW, y, GOLD, 2);

  let rowY = y + 16;
  for (const row of rows) {
    doc.font("Helvetica").fontSize(9).fillColor(MUTED);
    doc.text(row.label, boxX + 16, rowY, { width: boxW * 0.5, lineBreak: false });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INK);
    doc.text(row.value, boxX + boxW * 0.45, rowY, {
      width: boxW * 0.5,
      align: "right",
      lineBreak: false,
    });
    rowY += 22;
  }

  drawLine(doc, boxX + 12, rowY, boxX + boxW - 12, rowY, BORDER);
  rowY += 10;

  drawRect(doc, boxX + 8, rowY, boxW - 16, 36, INK, 2);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD);
  doc.text("TOTAL TTC", boxX + 20, rowY + 12, { lineBreak: false });
  doc.font("Helvetica-Bold").fontSize(13).fillColor(CREAM);
  doc.text(formatMoney(data.total, data.currencySymbol), boxX + boxW * 0.38, rowY + 10, {
    width: boxW * 0.56,
    align: "right",
    lineBreak: false,
  });

  return y + boxH + 20;
}

function drawNotesAndPayment(
  doc: PdfDoc,
  data: InvoiceDocumentData,
  startY: number
): number {
  const w = contentWidth(doc);
  const left = MARGIN;
  let y = startY;

  if (data.customMessage) {
    const msgH =
      doc.heightOfString(data.customMessage, { width: w - 28, lineGap: 2 }) + 24;
    drawRect(doc, left, y, w, 3, GOLD);
    drawRect(doc, left, y + 3, w, msgH, CREAM, 2);
    doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED);
    doc.text("MESSAGE", left + 14, y + 12);
    boundedText(
      doc,
      data.customMessage,
      left + 14,
      y + 24,
      w - 28,
      msgH - 20,
      { lineGap: 2 }
    );
    y += msgH + 12;
  }

  const colW = (w - 14) / 2;
  const blockH = 88;

  const drawBlock = (x: number, title: string, body: string) => {
    drawRect(doc, x, y, colW, blockH, SURFACE, 2);
    drawRect(doc, x, y, colW, 22, CREAM);
    doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED);
    doc.text(title, x + 12, y + 7, { lineBreak: false });
    boundedText(doc, body, x + 12, y + 30, colW - 24, blockH - 38, { lineGap: 3 });
  };

  drawBlock(left, "CONDITIONS DE PAIEMENT", data.paymentTerms);
  drawBlock(left + colW + 14, "COORDONNÉES BANCAIRES", data.bankDetails);

  y += blockH;

  if (data.notes) {
    y += 12;
    doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED);
    doc.text("NOTES COMPLÉMENTAIRES", left, y, { lineBreak: false });
    y += 12;
    boundedText(doc, data.notes, left, y, w, 60, { lineGap: 2 });
    y += 68;
  }

  return y;
}

function drawFooter(doc: PdfDoc, data: InvoiceDocumentData, contentEndY: number) {
  const w = contentWidth(doc);
  const left = MARGIN;
  const bottom = pageBottom(doc);
  const footerY = Math.min(contentEndY + 28, bottom - FOOTER_H);

  drawRect(doc, left, footerY, w, FOOTER_H, INK);
  drawRect(doc, left, footerY, w, 2, GOLD);

  doc.font("Helvetica").fontSize(7).fillColor(GOLD_LIGHT);
  boundedText(doc, data.footerNote, left, footerY + 10, w, 12, { align: "center" });
  doc.font("Helvetica").fontSize(6).fillColor(MUTED);
  boundedText(
    doc,
    `${data.issuer.name} · ${data.issuer.email} · Document généré le ${data.issuedAt.toLocaleDateString("fr-FR")}`,
    left,
    footerY + 24,
    w,
    10,
    { align: "center" }
  );
}

export function generateInvoicePdf(data: InvoiceDocumentData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: MARGIN, bottom: MARGIN + 52, left: MARGIN, right: MARGIN },
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = drawHeader(doc, data);
    y = drawMetaCards(doc, data, y);
    y = drawProjectBanner(doc, data, y);
    y = drawLineItemsTable(doc, data, y);
    y = drawTotalsBlock(doc, data, y);
    y = drawNotesAndPayment(doc, data, y);
    drawFooter(doc, data, y);

    doc.end();
  });
}
