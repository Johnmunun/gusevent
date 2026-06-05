"use client";

import { motion } from "framer-motion";
import { MediaImage } from "@/components/ui/MediaImage";
import { cn } from "@/lib/utils";

type GalleryCardProps = {
  image: string;
  sources: readonly string[];
  title: string;
  category: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  index?: number;
};

export function GalleryCard({
  image,
  sources,
  title,
  category,
  className,
  imageClassName,
  priority,
  index = 0,
}: GalleryCardProps) {
  return (
    <motion.figure
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.55, delay: index * 0.05 }}
      className={cn(
        "group relative min-h-[200px] overflow-hidden bg-ink",
        className
      )}
    >
      <MediaImage
        src={image}
        sources={sources}
        localOnly
        alt={title}
        fill
        priority={priority}
        className={cn(
          "object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]",
          imageClassName
        )}
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-95" />

      <div className="absolute inset-0 ring-1 ring-inset ring-white/0 transition-all duration-500 group-hover:ring-gold/40" />

      <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-5 transition-transform duration-500 group-hover:translate-y-0 sm:p-6">
        <span className="label-upper mb-2 inline-block text-gold">{category}</span>
        <p className="font-display text-lg leading-snug text-cream sm:text-xl md:text-2xl">
          {title}
        </p>
      </figcaption>

      <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center border border-white/20 bg-ink/40 text-xs font-medium text-cream opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100">
        +
      </div>
    </motion.figure>
  );
}
