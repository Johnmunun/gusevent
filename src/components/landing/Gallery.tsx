"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { GalleryCard } from "@/components/landing/GalleryCard";
import { defaultLandingCms } from "@/lib/cms/defaults";
import type { CmsGalleryContent, CmsGalleryItem, GalleryCategory } from "@/lib/cms/types";
import { ProjectsBadge } from "@/components/ui/ProjectsBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const bentoSlots = [
  "md:col-span-7 md:row-span-2 md:min-h-0",
  "md:col-span-5 md:row-span-1",
  "md:col-span-5 md:row-span-1",
  "md:col-span-4 md:row-span-1",
  "md:col-span-4 md:row-span-1",
  "md:col-span-4 md:row-span-1",
  "md:col-span-7 md:row-span-1",
  "md:col-span-5 md:row-span-1",
] as const;

type GalleryItem = CmsGalleryItem;

function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  return (
    <div className="md:hidden">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs text-muted">Glissez pour parcourir</p>
        <ChevronRight className="h-4 w-4 animate-pulse text-gold" />
      </div>
      <div className="scroll-carousel -mx-5 px-5">
        {items.map((item, index) => (
          <GalleryCard
            key={item.id}
            image={item.image}
            sources={item.sources}
            title={item.title}
            category={item.category}
            priority={index === 0}
            index={index}
            className="aspect-[3/4] w-[78vw] max-w-[300px] shrink-0 snap-center"
          />
        ))}
      </div>
    </div>
  );
}

type GalleryProps = {
  content?: CmsGalleryContent;
};

export function Gallery({ content = defaultLandingCms.gallery }: GalleryProps) {
  const [activeFilter, setActiveFilter] = useState<GalleryCategory>("all");
  const galleryItems = content.items;
  const galleryFilters = content.filters;

  const filtered =
    activeFilter === "all"
      ? [...galleryItems]
      : galleryItems.filter((item) => item.category === activeFilter);

  const useBento = activeFilter === "all" && filtered.length >= 6;

  return (
    <section id="realisations" className="section-padding bg-cream">
      <div className="container-wide">
        <div className="flex flex-col gap-6 border-b border-border pb-8 md:gap-8 md:pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <ProjectsBadge count={galleryItems.length} className="mb-5" />
            <SectionHeading
              align="left"
              eyebrow={content.heading.eyebrow}
              title={content.heading.title}
              description={content.heading.description}
              className="mb-0"
            />
          </div>

          <div className="scroll-filters -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            {galleryFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-all sm:text-sm",
                  activeFilter === filter.id
                    ? "bg-ink text-cream"
                    : "bg-surface text-muted ring-1 ring-border"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-muted md:mt-6">
          {filtered.length} projet{filtered.length > 1 ? "s" : ""}
        </p>

        <AnimatePresence mode="wait">
          {useBento ? (
            <motion.div
              key="bento"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GalleryCarousel items={filtered.slice(0, 8)} />

              <div className="mt-4 hidden md:grid md:grid-cols-12 md:auto-rows-[minmax(180px,1fr)] md:gap-4">
                {filtered.slice(0, 8).map((item, index) => (
                  <GalleryCard
                    key={item.id}
                    image={item.image}
                    sources={item.sources}
                    title={item.title}
                    category={item.category}
                    priority={index === 0}
                    index={index}
                    className={cn("min-h-[200px]", bentoSlots[index])}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${activeFilter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GalleryCarousel items={filtered} />

              <div className="mt-4 hidden gap-4 md:mt-8 md:grid md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item, index) => (
                  <GalleryCard
                    key={item.id}
                    image={item.image}
                    sources={item.sources}
                    title={item.title}
                    category={item.category}
                    index={index}
                    className={cn(
                      "aspect-[4/5] min-h-0",
                      index === 0 &&
                        filtered.length > 2 &&
                        "sm:col-span-2 sm:aspect-[16/10]"
                    )}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted">Aucun projet dans cette catégorie.</p>
        )}
      </div>
    </section>
  );
}
