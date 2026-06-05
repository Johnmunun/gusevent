"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { brand } from "@/config/brand";
import { DEFAULT_LOGO_CHAIN, type LogoSettings } from "@/lib/settings/logo-types";
import { cloudinaryPreviewUrl, isCloudinaryUrl } from "@/lib/cloudinary/utils";
import { cn } from "@/lib/utils";

export type LogoBranding = Pick<LogoSettings, "url" | "showText">;

type LogoProps = {
  variant?: "light" | "dark";
  /** Surcharge l’option stockée (ex. footer sans texte) */
  showText?: boolean;
  className?: string;
  imageClassName?: string;
  branding?: LogoBranding;
};

function resolveSrc(url: string) {
  return isCloudinaryUrl(url) ? cloudinaryPreviewUrl(url) : url;
}

export function Logo({
  variant = "dark",
  showText: showTextOverride,
  className,
  imageClassName,
  branding,
}: LogoProps) {
  const customUrl = branding?.url?.trim() ?? "";
  const showText = showTextOverride ?? branding?.showText ?? true;
  const useCustom = Boolean(customUrl);

  const [chainIndex, setChainIndex] = useState(0);
  const chainFailed = chainIndex >= DEFAULT_LOGO_CHAIN.length;
  const chainSrc = DEFAULT_LOGO_CHAIN[chainIndex];

  const [customFailed, setCustomFailed] = useState(false);

  const showFallback = useCustom ? customFailed : chainFailed;

  const customImageClass = cn(
    "h-9 w-auto max-w-[9rem] object-contain object-left sm:h-10 sm:max-w-[11rem]",
    imageClassName
  );

  return (
    <Link
      href="/"
      className={cn(
        "group flex min-w-0 shrink-0 items-center gap-2.5 transition-opacity duration-300 hover:opacity-90",
        className
      )}
    >
      {!showFallback ? (
        <span className="relative flex h-9 shrink-0 items-center sm:h-10">
          {useCustom ? (
            <Image
              src={resolveSrc(customUrl)}
              alt={brand.name}
              width={220}
              height={48}
              className={customImageClass}
              onError={() => setCustomFailed(true)}
              priority
              unoptimized={!customUrl.startsWith("https://")}
            />
          ) : (
            <span
              className={cn(
                "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl sm:h-10 sm:w-10",
                variant === "light"
                  ? "bg-white/5 ring-1 ring-white/15"
                  : "bg-surface ring-1 ring-border"
              )}
            >
              <Image
                src={chainSrc}
                alt={brand.name}
                width={120}
                height={120}
                className={cn("h-full w-full object-contain p-1.5", imageClassName)}
                onError={() => setChainIndex((i) => i + 1)}
                priority
              />
            </span>
          )}
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
            "truncate font-display text-lg font-semibold tracking-tight",
            variant === "light" ? "text-white" : "text-stone-900"
          )}
        >
          {brand.name}
        </span>
      )}
    </Link>
  );
}
