"use client";

import { useRef, useState } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import { cloudinaryVideoUrl, isCloudinaryUrl } from "@/lib/cloudinary/utils";
import type { CmsHeroContent } from "@/lib/cms/types";

const MAX_VIDEO_SECONDS = 10;

type HeroBackgroundProps = {
  content: CmsHeroContent;
};

export function HeroBackground({ content }: HeroBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rawVideo = content.backgroundVideo?.trim();
  const videoSrc =
    rawVideo && isCloudinaryUrl(rawVideo) ? cloudinaryVideoUrl(rawVideo) : "";
  const [videoOk, setVideoOk] = useState(Boolean(videoSrc));

  function handleTimeUpdate() {
    const el = videoRef.current;
    if (!el) return;
    if (el.currentTime >= MAX_VIDEO_SECONDS) {
      el.currentTime = 0;
    }
  }

  return (
    <div className="absolute inset-0 min-h-full">
      {videoOk && videoSrc ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-55 sm:opacity-60"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={content.backgroundImage}
          onTimeUpdate={handleTimeUpdate}
          onError={() => setVideoOk(false)}
        >
          <source src={videoSrc} />
        </video>
      ) : (
        <MediaImage
          src={content.backgroundImage}
          sources={content.backgroundImageFallbacks}
          localOnly
          alt=""
          fill
          priority
          className="object-cover object-center opacity-55 sm:opacity-60"
          sizes="100vw"
        />
      )}
      <div className="hero-overlay-mobile absolute inset-0 md:hidden" />
      <div className="hero-overlay absolute inset-0 hidden md:block" />
    </div>
  );
}
