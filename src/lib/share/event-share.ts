import { brand } from "@/config/brand";
import type { QuoteRequest } from "@prisma/client";
import { getAppUrl } from "@/lib/quotes/service";

export type PublicEventShare = {
  reference: string;
  title: string;
  date: string;
  location: string;
  url: string;
  shareText: string;
  links: ShareLinks;
};

export type ShareLinks = {
  whatsapp: string;
  facebook: string;
  linkedin: string;
  twitter: string;
};

export function formatEventDate(value: string | null): string {
  if (!value?.trim()) return "Date à préciser";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildPublicEventUrl(reference: string, appUrl?: string) {
  const base = (appUrl ?? getAppUrl()).replace(/\/$/, "");
  return `${base}/evenement/${encodeURIComponent(reference)}`;
}

export function buildShareText(input: {
  eventType: string;
  eventDate?: string | null;
  location?: string | null;
}) {
  const parts = [brand.name, input.eventType];
  const date = formatEventDate(input.eventDate ?? null);
  if (date !== "Date à préciser") parts.push(date);
  if (input.location?.trim()) parts.push(input.location.trim());
  return parts.join(" · ");
}

export function buildShareLinks(url: string, text: string): ShareLinks {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  return {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
  };
}

export function buildPublicEventShare(
  quote: Pick<
    QuoteRequest,
    "reference" | "eventType" | "eventDate" | "location" | "shareEnabled" | "status"
  >,
  appUrl?: string
): PublicEventShare | null {
  if (!quote.shareEnabled) return null;
  if (!["REPLIED", "CLOSED"].includes(quote.status)) return null;

  const url = buildPublicEventUrl(quote.reference, appUrl);
  const date = formatEventDate(quote.eventDate);
  const location = quote.location?.trim() || "Lieu à préciser";
  const shareText = buildShareText({
    eventType: quote.eventType,
    eventDate: quote.eventDate,
    location: quote.location,
  });

  return {
    reference: quote.reference,
    title: quote.eventType,
    date,
    location,
    url,
    shareText,
    links: buildShareLinks(url, shareText),
  };
}

export function isPublicEventVisible(
  quote: Pick<QuoteRequest, "shareEnabled" | "status">
) {
  return (
    quote.shareEnabled && ["REPLIED", "CLOSED"].includes(quote.status)
  );
}
