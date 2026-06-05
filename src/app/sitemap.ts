import type { MetadataRoute } from "next";
import { isPublicEventVisible } from "@/lib/share/event-share";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/devis`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${base}/mentions-legales`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/confidentialite`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const sharedEvents = await prisma.quoteRequest.findMany({
    where: {
      shareEnabled: true,
      status: { in: ["REPLIED", "CLOSED"] },
    },
    select: { reference: true, updatedAt: true, shareEnabled: true, status: true },
    take: 100,
  });

  const eventPages: MetadataRoute.Sitemap = sharedEvents
    .filter((q) => isPublicEventVisible(q))
    .map((q) => ({
      url: `${base}/evenement/${encodeURIComponent(q.reference)}`,
      lastModified: q.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [...staticPages, ...eventPages];
}
