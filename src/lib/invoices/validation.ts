import { z } from "zod";

export const invoiceLineItemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive().max(99999),
  unitPrice: z.number().min(0).max(99_999_999),
});

export const invoiceDocumentSchema = z.object({
  documentType: z.enum(["devis", "facture"]).default("facture"),
  lineItems: z.array(invoiceLineItemSchema).min(1).max(50),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  dueDate: z.string().trim().max(30).optional().or(z.literal("")),
  customMessage: z.string().trim().max(1000).optional().or(z.literal("")),
  send: z.boolean().optional().default(false),
});

export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;
export type InvoiceDocumentInput = z.infer<typeof invoiceDocumentSchema>;
