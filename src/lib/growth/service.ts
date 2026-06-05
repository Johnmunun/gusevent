import type { QuoteRequest } from "@prisma/client";
import { brand } from "@/config/brand";
import { getDashboardData, type DashboardData } from "@/lib/dashboard/service";
import { prisma } from "@/lib/prisma";

const HIGH_PRIORITY_MS = 48 * 60 * 60 * 1000;

export type ConversionMonthPoint = {
  month: string;
  rate: number;
  leads: number;
  converted: number;
};

export type NurtureLead = {
  id: string;
  name: string;
  eventType: string;
  createdAt: string;
  priority: "haute" | "normale";
};

export type MarketingChannel = {
  id: string;
  name: string;
  stat: string;
  action: string;
  href: string;
  external?: boolean;
};

export type MarketingContentIdea = {
  id: string;
  text: string;
  priority: "haute" | "normale";
  href?: string;
};

export type MarketingStats = {
  leadsThisMonth: number;
  contactsTotal: number;
  conversionRate: number;
  highPriorityLeads: number;
  totalLeads: number;
};

export type MarketingData = {
  stats: MarketingStats;
  channels: MarketingChannel[];
  contentIdeas: MarketingContentIdea[];
  nurtureLeads: NurtureLead[];
};

export type AnalyticsData = DashboardData & {
  conversionByMonth: ConversionMonthPoint[];
  nurtureLeads: NurtureLead[];
};

function getLast6MonthBuckets() {
  const buckets: { year: number; month: number; label: string; key: string }[] =
    [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d
        .toLocaleDateString("fr-FR", { month: "short" })
        .replace(/\.$/, "")
        .replace(/^./, (c) => c.toUpperCase()),
      key: `${d.getFullYear()}-${d.getMonth()}`,
    });
  }
  return buckets;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function isHighPriority(quote: QuoteRequest): boolean {
  if (quote.status !== "NEW") return false;
  return Date.now() - quote.createdAt.getTime() < HIGH_PRIORITY_MS;
}

function buildConversionByMonth(
  quotes: QuoteRequest[]
): ConversionMonthPoint[] {
  const buckets = getLast6MonthBuckets();

  return buckets.map((b) => {
    const monthQuotes = quotes.filter(
      (q) => monthKey(q.createdAt) === b.key
    );
    const converted = monthQuotes.filter((q) =>
      ["REPLIED", "CLOSED"].includes(q.status)
    ).length;
    const leads = monthQuotes.length;
    const rate = leads > 0 ? Math.round((converted / leads) * 100) : 0;

    return {
      month: b.label,
      rate,
      leads,
      converted,
    };
  });
}

function buildNurtureLeads(quotes: QuoteRequest[]): NurtureLead[] {
  return quotes
    .filter((q) => q.status === "NEW")
    .sort((a, b) => {
      const aP = isHighPriority(a) ? 0 : 1;
      const bP = isHighPriority(b) ? 0 : 1;
      if (aP !== bP) return aP - bP;
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, 5)
    .map((q) => ({
      id: q.id,
      name: q.fullName,
      eventType: q.eventType,
      createdAt: q.createdAt.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }),
      priority: isHighPriority(q) ? "haute" : "normale",
    }));
}

function buildMarketingStats(quotes: QuoteRequest[]): MarketingStats {
  const now = new Date();
  const thisMonthKey = monthKey(now);
  const emails = new Set(quotes.map((q) => q.email.toLowerCase()));
  const leadsThisMonth = quotes.filter(
    (q) => monthKey(q.createdAt) === thisMonthKey
  ).length;
  const confirmed = quotes.filter((q) =>
    ["REPLIED", "CLOSED"].includes(q.status)
  ).length;
  const conversionRate =
    quotes.length > 0 ? Math.round((confirmed / quotes.length) * 100) : 0;

  return {
    leadsThisMonth,
    contactsTotal: emails.size,
    conversionRate,
    highPriorityLeads: quotes.filter(isHighPriority).length,
    totalLeads: quotes.length,
  };
}

function topEventType(quotes: QuoteRequest[]): string | null {
  const counts = new Map<string, number>();
  for (const q of quotes) {
    counts.set(q.eventType, (counts.get(q.eventType) ?? 0) + 1);
  }
  let best: string | null = null;
  let max = 0;
  for (const [type, count] of counts) {
    if (count > max) {
      max = count;
      best = type;
    }
  }
  return best;
}

function buildContentIdeas(quotes: QuoteRequest[]): MarketingContentIdea[] {
  const ideas: MarketingContentIdea[] = [];

  for (const q of quotes.filter((x) => x.status === "CLOSED").slice(0, 2)) {
    ideas.push({
      id: `closed-${q.id}`,
      text: `Coulisses d'un ${q.eventType.toLowerCase()} — idée Reels portfolio`,
      priority: "normale",
      href: "/admin/portfolio",
    });
  }

  for (const q of quotes.filter((x) => x.status === "REPLIED").slice(0, 2)) {
    ideas.push({
      id: `reply-${q.id}`,
      text: `Témoignage client — ${q.fullName} (${q.eventType})`,
      priority: "haute",
      href: "/admin/clients",
    });
  }

  const popular = topEventType(quotes);
  if (popular) {
    ideas.push({
      id: "popular-type",
      text: `Carousel « 5 idées pour réussir un ${popular.toLowerCase()} »`,
      priority: "normale",
    });
  }

  const surprise = quotes.find((q) =>
    q.eventType.toLowerCase().includes("surprise")
  );
  if (surprise) {
    ideas.push({
      id: `surprise-${surprise.id}`,
      text: `Story sondage : organiser une surprise comme pour ${surprise.fullName} ?`,
      priority: "normale",
    });
  }

  for (const q of quotes.filter(isHighPriority).slice(0, 2)) {
    ideas.push({
      id: `nurture-${q.id}`,
      text: `Relancer ${q.fullName} — demande ${q.eventType} en attente`,
      priority: "haute",
      href: "/admin/devis",
    });
  }

  if (ideas.length === 0) {
    ideas.push({
      id: "default-1",
      text: "Publier les coulisses de votre prochain événement sur Instagram",
      priority: "normale",
      href: brand.instagram,
    });
    ideas.push({
      id: "default-2",
      text: "Mettre à jour le portfolio avec vos dernières réalisations",
      priority: "normale",
      href: "/admin/portfolio",
    });
  }

  return ideas.slice(0, 6);
}

function buildChannels(stats: MarketingStats): MarketingChannel[] {
  return [
    {
      id: "instagram",
      name: "Instagram",
      stat:
        stats.leadsThisMonth > 0
          ? `${stats.leadsThisMonth} demande${stats.leadsThisMonth > 1 ? "s" : ""} ce mois`
          : "Aucune demande ce mois",
      action: "Ouvrir Instagram",
      href: brand.instagram,
      external: true,
    },
    {
      id: "newsletter",
      name: "Newsletter",
      stat: `${stats.contactsTotal} contact${stats.contactsTotal > 1 ? "s" : ""} issus des devis`,
      action: "Voir les clients",
      href: "/admin/clients",
    },
    {
      id: "site",
      name: "Site & devis",
      stat: `${stats.totalLeads} lead${stats.totalLeads > 1 ? "s" : ""} accumulé${stats.totalLeads > 1 ? "s" : ""}`,
      action: "Voir le site",
      href: "/",
      external: true,
    },
  ];
}

export async function getMarketingData(): Promise<MarketingData> {
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const stats = buildMarketingStats(quotes);

  return {
    stats,
    channels: buildChannels(stats),
    contentIdeas: buildContentIdeas(quotes),
    nurtureLeads: buildNurtureLeads(quotes),
  };
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [dashboard, quotes] = await Promise.all([
    getDashboardData(),
    prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return {
    ...dashboard,
    conversionByMonth: buildConversionByMonth(quotes),
    nurtureLeads: buildNurtureLeads(quotes),
  };
}
