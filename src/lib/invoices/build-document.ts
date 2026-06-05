import type { QuoteRequest } from "@prisma/client";
import { invoiceConfig } from "@/config/invoice";
import { currencies } from "@/lib/quote";
import type { InvoiceDocumentInput, InvoiceLineItem } from "@/lib/invoices/validation";

export type InvoiceDocumentData = {
  documentType: "devis" | "facture";
  documentNumber: string;
  documentTitle: string;
  issuedAt: Date;
  dueDate: string | null;
  quoteReference: string;
  currency: string;
  currencySymbol: string;
  issuer: {
    name: string;
    tagline: string;
    address: string;
    email: string;
    phone: string;
  };
  client: {
    name: string;
    email: string;
    phone: string;
    company: string | null;
  };
  project: {
    eventType: string;
    eventDate: string | null;
    guestCount: string | null;
    location: string | null;
    budgetLabel: string;
  };
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  customMessage: string | null;
  paymentTerms: string;
  bankDetails: string;
  footerNote: string;
};

function getCurrencySymbol(code: string): string {
  const match = currencies.find((c) => c.code === code);
  return match?.symbol ?? code;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildDocumentNumber(
  documentType: "devis" | "facture",
  quoteReference: string
): string {
  const suffix = quoteReference.replace(/^DEV-/i, "");
  const prefix = documentType === "facture" ? "FAC" : "DEV";
  return `${prefix}-${suffix}`;
}

export function buildInvoiceDocument(
  quote: QuoteRequest,
  input: InvoiceDocumentInput
): InvoiceDocumentData {
  const lineItems = input.lineItems.map((item) => ({
    ...item,
    quantity: roundMoney(item.quantity),
    unitPrice: roundMoney(item.unitPrice),
  }));

  const subtotal = roundMoney(
    lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  );
  const taxRate = roundMoney(input.taxRate);
  const taxAmount = roundMoney(subtotal * (taxRate / 100));
  const total = roundMoney(subtotal + taxAmount);

  const documentTitle =
    input.documentType === "facture" ? "FACTURE" : "DEVIS";

  return {
    documentType: input.documentType,
    documentNumber: buildDocumentNumber(input.documentType, quote.reference),
    documentTitle,
    issuedAt: new Date(),
    dueDate: input.dueDate || null,
    quoteReference: quote.reference,
    currency: quote.currency,
    currencySymbol: getCurrencySymbol(quote.currency),
    issuer: {
      name: invoiceConfig.issuerName,
      tagline: invoiceConfig.issuerTagline,
      address: invoiceConfig.issuerAddress,
      email: invoiceConfig.issuerEmail,
      phone: invoiceConfig.issuerPhone,
    },
    client: {
      name: quote.fullName,
      email: quote.email,
      phone: quote.phone,
      company: quote.company,
    },
    project: {
      eventType: quote.eventType,
      eventDate: quote.eventDate,
      guestCount: quote.guestCount,
      location: quote.location,
      budgetLabel: quote.budgetLabel,
    },
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    total,
    notes: input.notes || null,
    customMessage: input.customMessage || null,
    paymentTerms: invoiceConfig.paymentTerms,
    bankDetails: invoiceConfig.bankDetails,
    footerNote: invoiceConfig.footerNote,
  };
}

export function formatMoney(amount: number, symbol: string): string {
  return `${amount.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${symbol}`;
}
