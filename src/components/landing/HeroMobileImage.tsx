"use client";

import { motion } from "framer-motion";
import { MediaImage } from "@/components/ui/MediaImage";
import { media } from "@/config/media";

export function HeroMobileImage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-8 w-full lg:hidden"
    >
      <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden ring-1 ring-white/15">
        <MediaImage
          src={media.hero.visualMain}
          sources={[...media.hero.imageFallbacks, media.hero.image]}
          localOnly
          alt="Réalisation gusEvent"
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
      </div>
    </motion.div>
  );
}
