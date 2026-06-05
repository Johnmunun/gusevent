"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";
import { isCloudinaryUrl } from "@/lib/cloudinary/utils";
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

function isRemoteUrl(path: string): boolean {
  return path.startsWith("http://") || path.startsWith("https://");
}

function jpegAlt(jpgPath: string) {
  return jpgPath.replace(/\.jpg$/i, ".jpeg");
}

function buildCandidates(src: string, sources?: readonly string[]) {
  if (isRemoteUrl(src)) {
    return [src];
  }

  const list = [src, ...(sources ?? []).filter((s) => !isRemoteUrl(s) || s === src)];
  const withJpeg = list.flatMap((path) =>
    path.endsWith(".jpg") ? [path, jpegAlt(path)] : [path]
  );
  return [...new Set(withJpeg)];
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
  const candidates = useMemo(
    () => buildCandidates(src, sources),
    [src, sources]
  );

  const [index, setIndex] = useState(0);
  const currentSrc = candidates[index] ?? src;
  const isLocal =
    currentSrc.startsWith("/media") || currentSrc.startsWith("/uploads");
  const useUnoptimized =
    isLocal ||
    currentSrc.startsWith("/media") ||
    isCloudinaryUrl(currentSrc);

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
      unoptimized={useUnoptimized}
      className={cn(className)}
      onError={handleError}
    />
  );
}
