"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type MediaImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  /** Chemins alternatifs (vos .jpeg, etc.) essayés avant le fallback distant */
  sources?: readonly string[];
  fallbackSrc?: string;
  /** Ne pas charger d'image Unsplash — uniquement vos fichiers locaux */
  localOnly?: boolean;
  alt: string;
};

function jpegAlt(jpgPath: string) {
  return jpgPath.replace(/\.jpg$/i, ".jpeg");
}

export function MediaImage({
  src,
  sources,
  fallbackSrc,
  localOnly = false,
  alt,
  className,
  fill,
  priority,
  sizes,
  ...props
}: MediaImageProps) {
  const candidates = useMemo(() => {
    const list = [src, ...(sources ?? [])];
    const withJpeg = list.flatMap((path) =>
      path.endsWith(".jpg") ? [path, jpegAlt(path)] : [path]
    );
    return [...new Set(withJpeg)];
  }, [src, sources]);

  const [index, setIndex] = useState(0);
  const currentSrc = candidates[index] ?? src;
  const isLocal = currentSrc.startsWith("/media");

  const handleError = () => {
    if (index < candidates.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    if (!localOnly && fallbackSrc && currentSrc !== fallbackSrc) {
      setIndex(candidates.length);
    }
  };

  const displaySrc =
    index >= candidates.length && fallbackSrc ? fallbackSrc : currentSrc;

  return (
    <Image
      {...props}
      src={displaySrc}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      unoptimized={isLocal || displaySrc.startsWith("/media")}
      className={cn(className)}
      onError={handleError}
    />
  );
}
