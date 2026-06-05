"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { brand } from "@/config/brand";
import { media } from "@/config/media";
import { cn } from "@/lib/utils";

const logoChain = [media.logo.svg, media.logo.png, media.logo.jpg] as const;

type LogoProps = {
  variant?: "light" | "dark";
  showText?: boolean;
  className?: string;
  imageClassName?: string;
};

export function Logo({
  variant = "dark",
  showText = true,
  className,
  imageClassName,
}: LogoProps) {
  const [index, setIndex] = useState(0);
  const failed = index >= logoChain.length;
  const src = logoChain[index];

  const handleError = () => {
    setIndex((i) => i + 1);
  };

  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      {!failed ? (
        <span
          className={cn(
            "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-10 sm:w-10",
            variant === "light"
              ? "bg-white/5 ring-1 ring-white/15"
              : "bg-surface ring-1 ring-border"
          )}
        >
          <Image
            src={src}
            alt={brand.name}
            width={120}
            height={120}
            className={cn("h-full w-full object-contain p-1.5", imageClassName)}
            onError={handleError}
            priority
          />
        </span>
      ) : (
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold transition-transform group-hover:scale-105 sm:h-10 sm:w-10",
            variant === "light"
              ? "bg-white text-stone-900"
              : "bg-stone-900 text-white"
          )}
        >
          {brand.fallbackInitial}
        </span>
      )}
      {showText && (
        <span
          className={cn(
            "font-display text-lg font-semibold tracking-tight",
            variant === "light" ? "text-white" : "text-stone-900"
          )}
        >
          {brand.name}
        </span>
      )}
    </Link>
  );
}
