import { CMS_SECTION_LABELS } from "@/lib/cms/defaults";
import { getCmsSection, getLandingCms } from "@/lib/cms/get-content";
import { CMS_SLUGS, type CmsGalleryItem, type CmsSlug } from "@/lib/cms/types";
import {
  getCloudinaryFolder,
  isCloudinaryConfigured,
  isCloudinaryUrl,
} from "@/lib/cloudinary/utils";
import { prisma } from "@/lib/prisma";

export type CmsSectionOverview = {
  slug: CmsSlug;
  label: string;
  customized: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type CmsOverviewData = {
  sections: CmsSectionOverview[];
  customizedCount: number;
  lastUpdated: string | null;
};

export type PortfolioItem = CmsGalleryItem;

export type PortfolioData = {
  heading: {
    eyebrow: string;
    title: string;
    description: string;
  };
  items: PortfolioItem[];
  filters: { id: string; label: string }[];
  stats: {
    total: number;
    byCategory: Record<string, number>;
    uploadedCms: number;
    cloudinary: number;
    localMedia: number;
  };
  storage: {
    provider: "cloudinary" | "local";
    mediaPath: string;
    cmsUploadPath: string;
    cloudinaryFolder: string;
    syncCommand: string;
    note: string;
  };
};

export async function getCmsOverview(): Promise<CmsOverviewData> {
  const rows = await prisma.cmsSection.findMany({
    select: { slug: true, updatedAt: true, updatedBy: true },
  });
  const rowMap = new Map(rows.map((r) => [r.slug, r]));

  const sections: CmsSectionOverview[] = CMS_SLUGS.map((slug) => {
    const row = rowMap.get(slug);
    return {
      slug,
      label: CMS_SECTION_LABELS[slug],
      customized: Boolean(row),
      updatedAt: row?.updatedAt.toISOString() ?? null,
      updatedBy: row?.updatedBy ?? null,
    };
  });

  const customizedCount = sections.filter((s) => s.customized).length;
  const lastUpdated = rows.reduce<string | null>((latest, row) => {
    const iso = row.updatedAt.toISOString();
    return !latest || iso > latest ? iso : latest;
  }, null);

  return { sections, customizedCount, lastUpdated };
}

function countByCategory(items: PortfolioItem[]) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }
  return counts;
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const gallery = await getCmsSection("gallery");
  const cms = await getLandingCms();

  const allUrls = [
    cms.hero.backgroundImage,
    ...cms.hero.backgroundImageFallbacks,
    ...gallery.items.flatMap((i) => [i.image, ...i.sources]),
    ...cms.testimonials.items.map((t) => t.image),
  ];

  const uploadedCms = allUrls.filter((url) => url.startsWith("/uploads/")).length;
  const cloudinary = allUrls.filter(isCloudinaryUrl).length;

  const localMedia = gallery.items.filter(
    (i) => i.image.startsWith("/media/") || i.sources.some((s) => s.startsWith("/media/"))
  ).length;

  const cloudinaryActive = isCloudinaryConfigured();

  return {
    heading: gallery.heading,
    items: gallery.items,
    filters: gallery.filters.map((f) => ({ id: f.id, label: f.label })),
    stats: {
      total: gallery.items.length,
      byCategory: countByCategory(gallery.items),
      uploadedCms,
      cloudinary,
      localMedia,
    },
    storage: {
      provider: cloudinaryActive ? "cloudinary" : "local",
      mediaPath: "public/media/",
      cmsUploadPath: cloudinaryActive
        ? "Cloudinary (res.cloudinary.com)"
        : "public/uploads/cms/",
      cloudinaryFolder: getCloudinaryFolder(),
      syncCommand: "npm run media:sync",
      note: cloudinaryActive
        ? "Les uploads depuis le CMS partent sur Cloudinary (dossier gusevent/cms). Les anciens fichiers /media/ restent utilisables via npm run media:sync en local."
        : "Configurez CLOUDINARY_URL pour stocker les uploads en cloud. Sinon : public/media/ + npm run media:sync ou public/uploads/cms/ en local.",
    },
  };
}
