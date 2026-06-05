import { z } from "zod";
import {
  currencies,
  eventTypeOptions,
  type BudgetRangeId,
  type CurrencyCode,
} from "@/lib/quote";

const currencyCodes = currencies.map((c) => c.code) as [
  CurrencyCode,
  ...CurrencyCode[],
];

const budgetIds: [BudgetRangeId, ...BudgetRangeId[]] = [
  "tbd",
  "lt5k",
  "5k-15k",
  "15k-30k",
  "30k-50k",
  "gt50k",
];

export const quoteRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(40),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  eventType: z
    .string()
    .refine(
      (v): v is (typeof eventTypeOptions)[number] =>
        (eventTypeOptions as readonly string[]).includes(v),
      "Type d'événement invalide"
    ),
  eventDate: z.string().trim().max(30).optional().or(z.literal("")),
  guestCount: z.string().trim().max(20).optional().or(z.literal("")),
  currency: z.enum(currencyCodes),
  budget: z.enum(budgetIds),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export const quoteLookupSchema = z.object({
  reference: z.string().trim().min(5).max(30),
  email: z.string().trim().email().max(200),
});

export const quoteClientUpdateSchema = quoteRequestSchema.extend({
  verifyEmail: z.string().trim().email().max(200),
});

export const adminQuotePatchSchema = quoteRequestSchema
  .partial()
  .extend({
    status: z.enum(["NEW", "IN_PROGRESS", "REPLIED", "CLOSED"]).optional(),
    shareEnabled: z.boolean().optional(),
  });
