import type { QuoteRequest } from "@prisma/client";
import { brand } from "@/config/brand";
import { sendMail } from "@/lib/email/mailer";
import { getEmailSettings } from "@/lib/settings/email-settings";
import { prisma } from "@/lib/prisma";
import {
  REMINDER_LABELS,
  REMINDER_THRESHOLDS_DAYS,
  reminderKey,
  type ReminderThresholdDays,
} from "@/lib/reminders/config";

export type ReminderProcessResult = {
  scanned: number;
  created: number;
  emailed: number;
  skipped: number;
};

const ACTIVE_STATUSES = ["IN_PROGRESS", "REPLIED"] as const;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseEventDate(value: string | null): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function daysUntilEvent(eventDate: Date): number {
  const today = startOfDay(new Date());
  const diff = eventDate.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatEventDate(value: string | null): string {
  const parsed = parseEventDate(value);
  if (!parsed) return "Date à préciser";
  return parsed.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildNotificationTitle(days: ReminderThresholdDays): string {
  if (days === 0) return "Événement aujourd'hui";
  return `Rappel événement — ${REMINDER_LABELS[days]}`;
}

function buildNotificationMessage(quote: QuoteRequest): string {
  return `${quote.fullName} — ${quote.eventType} · ${formatEventDate(quote.eventDate)}`;
}

function buildEmailSubject(
  quote: QuoteRequest,
  days: ReminderThresholdDays
): string {
  return `[Rappel ${brand.name}] ${quote.eventType} — ${REMINDER_LABELS[days]}`;
}

function buildEmailBody(
  quote: QuoteRequest,
  days: ReminderThresholdDays,
  appUrl: string
): string {
  const editLink = `${appUrl}/admin/devis?edit=${quote.id}`;
  const calendarLink = `${appUrl}/admin/calendrier`;

  return `Bonjour,

Rappel automatique : un événement approche (${REMINDER_LABELS[days]}).

Référence : ${quote.reference}
Client : ${quote.fullName}
Type : ${quote.eventType}
Date : ${formatEventDate(quote.eventDate)}
Lieu : ${quote.location || "À préciser"}
Statut dossier : ${quote.status}

Ouvrir la fiche projet :
${editLink}

Voir le calendrier :
${calendarLink}

— ${brand.name}`;
}

async function createReminder(
  quote: QuoteRequest,
  days: ReminderThresholdDays,
  appUrl: string
): Promise<{ created: boolean; emailed: boolean }> {
  const key = reminderKey(days);

  try {
    await prisma.eventReminderLog.create({
      data: {
        quoteId: quote.id,
        reminderKey: key,
        emailed: false,
      },
    });
  } catch {
    return { created: false, emailed: false };
  }

  await prisma.adminNotification.create({
    data: {
      type: "event_reminder",
      title: buildNotificationTitle(days),
      message: buildNotificationMessage(quote),
      link: `/admin/devis?edit=${quote.id}`,
      meta: {
        quoteId: quote.id,
        reference: quote.reference,
        reminderKey: key,
        daysBefore: days,
        eventDate: quote.eventDate,
      },
    },
  });

  let emailed = false;
  const settings = await getEmailSettings();

  if (settings.enabled && settings.adminNotifyTo) {
    const mail = await sendMail(settings, {
      to: settings.adminNotifyTo,
      subject: buildEmailSubject(quote, days),
      text: buildEmailBody(quote, days, appUrl),
    });
    emailed = mail.ok;
  }

  if (emailed) {
    await prisma.eventReminderLog.updateMany({
      where: { quoteId: quote.id, reminderKey: key },
      data: { emailed: true },
    });
  }

  return { created: true, emailed };
}

export async function processEventReminders(): Promise<ReminderProcessResult> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const quotes = await prisma.quoteRequest.findMany({
    where: {
      status: { in: [...ACTIVE_STATUSES] },
      eventDate: { not: null },
    },
  });

  const existing = await prisma.eventReminderLog.findMany({
    where: {
      quoteId: { in: quotes.map((q) => q.id) },
    },
    select: { quoteId: true, reminderKey: true },
  });

  const sent = new Set(
    existing.map(
      (row: { quoteId: string; reminderKey: string }) =>
        `${row.quoteId}:${row.reminderKey}`
    )
  );

  let created = 0;
  let emailed = 0;
  let skipped = 0;

  for (const quote of quotes) {
    const eventDate = parseEventDate(quote.eventDate);
    if (!eventDate) {
      skipped += 1;
      continue;
    }

    const daysLeft = daysUntilEvent(eventDate);
    if (daysLeft < 0) {
      skipped += 1;
      continue;
    }

    const threshold = REMINDER_THRESHOLDS_DAYS.find((d) => d === daysLeft);
    if (threshold === undefined) {
      skipped += 1;
      continue;
    }

    const key = reminderKey(threshold);
    if (sent.has(`${quote.id}:${key}`)) {
      skipped += 1;
      continue;
    }

    const result = await createReminder(quote, threshold, appUrl);
    if (!result.created) {
      skipped += 1;
      continue;
    }
    sent.add(`${quote.id}:${key}`);
    created += 1;
    if (result.emailed) emailed += 1;
  }

  return {
    scanned: quotes.length,
    created,
    emailed,
    skipped,
  };
}
