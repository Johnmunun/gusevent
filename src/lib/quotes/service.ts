import type { QuoteRequest, QuoteRequestStatus } from "@prisma/client";
import { brand } from "@/config/brand";
import { renderTemplate } from "@/lib/email/render-template";
import { sendMail } from "@/lib/email/mailer";
import {
  getBudgetLabel,
  type BudgetRangeId,
  type CurrencyCode,
  type QuoteFormData,
} from "@/lib/quote";
import { prisma } from "@/lib/prisma";
import { getEmailSettings } from "@/lib/settings/email-settings";
import type { QuoteRequestInput } from "@/lib/quotes/validation";

function generateReference(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DEV-${y}${m}${d}-${rand}`;
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function templateVars(quote: QuoteRequest, appUrl: string) {
  return {
    reference: quote.reference,
    fullName: quote.fullName,
    email: quote.email,
    phone: quote.phone,
    company: quote.company || "—",
    eventType: quote.eventType,
    eventDate: quote.eventDate || "À préciser",
    guestCount: quote.guestCount || "À préciser",
    budgetLabel: quote.budgetLabel,
    location: quote.location || "À préciser",
    message: quote.message || "(aucun message)",
    brandName: brand.name,
    adminLink: `${appUrl}/admin/devis`,
    modifyLink: `${appUrl}/devis/modifier?ref=${encodeURIComponent(quote.reference)}`,
  };
}

export function quoteToFormData(quote: QuoteRequest): QuoteFormData {
  return {
    fullName: quote.fullName,
    email: quote.email,
    phone: quote.phone,
    company: quote.company ?? "",
    eventType: quote.eventType as QuoteFormData["eventType"],
    eventDate: quote.eventDate ?? "",
    guestCount: quote.guestCount ?? "",
    currency: quote.currency as CurrencyCode,
    budget: quote.budget as BudgetRangeId,
    location: quote.location ?? "",
    message: quote.message ?? "",
  };
}

export const CLIENT_EDITABLE_STATUSES: QuoteRequestStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "REPLIED",
];

export async function createQuoteRequest(input: QuoteRequestInput) {
  const budgetLabel = getBudgetLabel(
    input.budget,
    input.currency as CurrencyCode
  );

  let reference = generateReference();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.quoteRequest.findUnique({ where: { reference } });
    if (!exists) break;
    reference = generateReference();
  }

  const quote = await prisma.quoteRequest.create({
    data: {
      reference,
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      company: input.company || null,
      eventType: input.eventType,
      eventDate: input.eventDate || null,
      guestCount: input.guestCount || null,
      currency: input.currency,
      budget: input.budget,
      budgetLabel,
      location: input.location || null,
      message: input.message || null,
    },
  });

  await prisma.adminNotification.create({
    data: {
      type: "quote_request",
      title: "Nouvelle demande de devis",
      message: `${quote.fullName} — ${quote.eventType}`,
      link: "/admin/devis",
      meta: {
        quoteId: quote.id,
        reference: quote.reference,
      },
    },
  });

  return quote;
}

export async function findQuoteByReferenceAndEmail(
  reference: string,
  email: string
) {
  const normalizedRef = reference.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  return prisma.quoteRequest.findFirst({
    where: {
      reference: { equals: normalizedRef, mode: "insensitive" },
      email: normalizedEmail,
    },
  });
}

type QuoteUpdateInput = Partial<QuoteRequestInput> & {
  status?: QuoteRequestStatus;
  shareEnabled?: boolean;
};

export async function updateQuoteRequest(
  quote: QuoteRequest,
  input: QuoteUpdateInput
) {
  const currency = (input.currency ?? quote.currency) as CurrencyCode;
  const budget = (input.budget ?? quote.budget) as BudgetRangeId;
  const budgetLabel =
    input.budget !== undefined || input.currency !== undefined
      ? getBudgetLabel(budget, currency)
      : undefined;

  const updated = await prisma.quoteRequest.update({
    where: { id: quote.id },
    data: {
      ...(input.fullName !== undefined && { fullName: input.fullName }),
      ...(input.email !== undefined && { email: input.email.toLowerCase() }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.company !== undefined && {
        company: input.company || null,
      }),
      ...(input.eventType !== undefined && { eventType: input.eventType }),
      ...(input.eventDate !== undefined && {
        eventDate: input.eventDate || null,
      }),
      ...(input.guestCount !== undefined && {
        guestCount: input.guestCount || null,
      }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.budget !== undefined && { budget: input.budget }),
      ...(budgetLabel !== undefined && { budgetLabel }),
      ...(input.location !== undefined && {
        location: input.location || null,
      }),
      ...(input.message !== undefined && {
        message: input.message || null,
      }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.shareEnabled !== undefined && {
        shareEnabled: input.shareEnabled,
      }),
    },
  });

  return updated;
}

export async function notifyQuoteUpdated(quote: QuoteRequest) {
  await prisma.adminNotification.create({
    data: {
      type: "quote_request",
      title: "Demande de devis modifiée",
      message: `${quote.fullName} — ${quote.eventType}`,
      link: "/admin/devis",
      meta: {
        quoteId: quote.id,
        reference: quote.reference,
        updated: true,
      },
    },
  });
}

export async function dispatchQuoteEmails(quoteId: string) {
  const quote = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  if (!quote) return;

  const settings = await getEmailSettings();
  const appUrl = getAppUrl();
  const vars = templateVars(quote, appUrl);

  const clientResult = await sendMail(settings, {
    to: quote.email,
    subject: renderTemplate(settings.clientSubject, vars),
    text: renderTemplate(settings.clientBody, vars),
  });

  const adminResult = await sendMail(settings, {
    to: settings.adminNotifyTo,
    subject: renderTemplate(settings.adminSubject, vars),
    text: renderTemplate(settings.adminBody, vars),
  });

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: {
      clientEmailSent: clientResult.ok,
      adminEmailSent: adminResult.ok,
      clientEmailError: clientResult.ok ? null : clientResult.error,
      adminEmailError: adminResult.ok ? null : adminResult.error,
    },
  });
}
