"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaImage } from "@/components/ui/MediaImage";
import { defaultLandingCms } from "@/lib/cms/defaults";
import type { CmsTestimonialsContent } from "@/lib/cms/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type TestimonialsProps = {
  content?: CmsTestimonialsContent;
};

export function Testimonials({
  content = defaultLandingCms.testimonials,
}: TestimonialsProps) {
  const [current, setCurrent] = useState(0);
  const total = content.items.length;
  const active = content.items[current];

  return (
    <section id="temoignages" className="section-padding bg-ink text-cream">
      <div className="container-wide">
        <SectionHeading
          theme="dark"
          eyebrow={content.heading.eyebrow}
          title={content.heading.title}
          description={content.heading.description}
        />

        <div className="relative mt-10 grid gap-8 md:mt-16 md:gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl"
            >
              <span className="font-display text-8xl leading-none text-gold/20">
                &ldquo;
              </span>
              <blockquote className="-mt-6 font-display text-xl font-normal italic leading-snug text-cream sm:-mt-8 sm:text-3xl md:text-4xl">
                {active.quote}
              </blockquote>
              <div className="mt-12 flex items-center gap-5">
                <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-gold/50">
                  <MediaImage
                    src={active.image}
                    fallbackSrc={active.fallback}
                    alt={active.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-cream">{active.name}</p>
                  <p className="text-sm text-stone-500">
                    {active.role} — {active.company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-4 lg:flex-col">
            <motion.button
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setCurrent((c) => (c - 1 + total) % total)}
              aria-label="Précédent"
              className="flex h-12 w-12 items-center justify-center border border-white/15 text-cream transition-colors hover:border-gold hover:text-gold"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <div className="flex gap-2 lg:flex-col">
              {content.items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Témoignage ${i + 1}`}
                  className={cn(
                    "h-2 w-2 transition-all",
                    i === current ? "bg-gold" : "bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setCurrent((c) => (c + 1) % total)}
              aria-label="Suivant"
              className="flex h-12 w-12 items-center justify-center border border-white/15 text-cream transition-colors hover:border-gold hover:text-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
