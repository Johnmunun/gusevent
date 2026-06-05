"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/ui/MediaImage";
import { media } from "@/config/media";

const visualFallbacks = [
  media.hero.imageFallbacks[1],
  media.hero.imageFallbacks[2],
  "/media/gallery/11.jpeg",
  "/media/gallery/12.jpeg",
];

export function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden lg:block"
    >
      <div className="relative pl-8">
        <div className="absolute top-8 bottom-8 left-0 w-px bg-gold/50" />
        <div className="absolute top-8 -left-1 h-2 w-2 rounded-full bg-gold" />

        <div className="relative aspect-[3/4] max-h-[32rem] overflow-hidden">
          <MediaImage
            src={media.hero.visualMain}
            sources={[...visualFallbacks, media.hero.image]}
            localOnly
            alt="Vos réalisations — gusEvent"
            fill
            className="object-cover"
            sizes="480px"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
        </div>

        <div className="absolute -bottom-6 -left-6 w-[55%] overflow-hidden border-4 border-cream shadow-2xl">
          <div className="relative aspect-[4/3]">
            <MediaImage
              src={media.hero.visualSmall}
              sources={[
                media.hero.imageFallbacks[2],
                media.hero.imageFallbacks[0],
                "/media/gallery/1.jpeg",
              ]}
              localOnly
              alt="Événement — gusEvent"
              fill
              className="object-cover"
              sizes="280px"
            />
          </div>
        </div>

        <Link
          href="/#realisations"
          className="absolute -right-4 top-1/2 flex h-28 w-28 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-gold/40 bg-ink/90 text-center text-cream backdrop-blur-sm transition-colors hover:border-gold hover:bg-ink"
        >
          <ArrowUpRight className="mb-1 h-5 w-5 text-gold" />
          <span className="text-[10px] font-medium tracking-widest uppercase">
            Voir
          </span>
          <span className="font-display text-sm italic">plus</span>
        </Link>
      </div>
    </motion.div>
  );
}
