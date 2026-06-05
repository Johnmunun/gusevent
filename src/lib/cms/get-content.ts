import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { defaultLandingCms } from "@/lib/cms/defaults";
import type { CmsSlug, LandingCmsContent } from "@/lib/cms/types";

function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(patch)) return patch as T;
  if (typeof patch !== "object" || typeof base !== "object" || base === null) {
    return (patch as T) ?? base;
  }
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(patch as object)) {
    const b = (base as Record<string, unknown>)[key];
    const p = (patch as Record<string, unknown>)[key];
    out[key] =
      typeof b === "object" && b !== null && !Array.isArray(b) && typeof p === "object" && p !== null && !Array.isArray(p)
        ? deepMerge(b, p)
        : p;
  }
  return out as T;
}

export const getLandingCms = cache(async function getLandingCms(): Promise<LandingCmsContent> {
  if (!process.env.DATABASE_URL) {
    return defaultLandingCms;
  }

  try {
    const rows = await prisma.cmsSection.findMany();
    if (rows.length === 0) return defaultLandingCms;

    let merged = { ...defaultLandingCms };
    for (const row of rows) {
      const slug = row.slug as CmsSlug;
      if (slug in merged) {
        merged = {
          ...merged,
          [slug]: deepMerge(merged[slug], row.content),
        };
      }
    }
    return merged;
  } catch {
    return defaultLandingCms;
  }
});

export async function getCmsSection<K extends CmsSlug>(
  slug: K
): Promise<LandingCmsContent[K]> {
  const all = await getLandingCms();
  return all[slug];
}

export async function saveCmsSection<K extends CmsSlug>(
  slug: K,
  content: LandingCmsContent[K],
  updatedBy?: string
): Promise<void> {
  await prisma.cmsSection.upsert({
    where: { slug },
    create: { slug, content: content as object, updatedBy },
    update: { content: content as object, updatedBy },
  });
}

export async function seedCmsFromDefaults(): Promise<void> {
  const slugs = Object.keys(defaultLandingCms) as CmsSlug[];
  for (const slug of slugs) {
    await prisma.cmsSection.upsert({
      where: { slug },
      create: {
        slug,
        content: defaultLandingCms[slug] as object,
      },
      update: {},
    });
  }
}
