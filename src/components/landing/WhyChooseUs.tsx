"use client";

import { useEffect, useState } from "react";
import { brand } from "@/config/brand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { defaultLandingCms } from "@/lib/cms/defaults";
import type { CmsAboutContent } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

const AUTO_INTERVAL_MS = 6000;

type WhyChooseUsProps = {
  content?: CmsAboutContent;
};

export function WhyChooseUs({
  content = defaultLandingCms.about,
}: WhyChooseUsProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = content.slides;
  const total = slides.length;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((index) => (index + 1) % total);
    }, AUTO_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, total]);

  return (
    <section id="apropos" className="section-padding bg-ink text-cream">
      <div className="container-wide">
        <SectionHeading
          theme="dark"
          align="left"
          eyebrow={content.heading.eyebrow}
          title={content.heading.title}
          description={content.heading.description}
        />

        <div
          className="relative mt-10 md:mt-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          {/* Cadre inspiré de la charte Instagram, adapté au site */}
          <div className="relative border-4 border-gold bg-ink/80 p-6 sm:p-10 md:p-12 shimmer-hover">
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4 text-[10px] font-semibold tracking-[0.2em] text-stone-500 uppercase sm:text-[11px]">
              <span>{brand.name}</span>
              <span>{brand.foundedYear}</span>
            </div>

            <div className="relative overflow-hidden">
              <div className="grid [&>article]:col-start-1 [&>article]:row-start-1">
                {slides.map((slide, index) => {
                  const isActive = index === current;

                  return (
                    <article
                      key={slide.id}
                      className={cn(
                        "transition-opacity duration-500 ease-out",
                        isActive
                          ? "z-10 opacity-100"
                          : "pointer-events-none z-0 opacity-0"
                      )}
                      aria-hidden={!isActive}
                      {...(isActive ? { "aria-live": "polite" as const } : {})}
                    >
                      <h3 className="font-display text-2xl font-medium tracking-tight text-gold uppercase sm:text-3xl md:text-4xl">
                        {slide.title}
                      </h3>

                      {slide.type === "prose" ? (
                        <p className="mt-6 max-w-3xl text-base leading-relaxed text-stone-300 sm:text-lg">
                          {slide.body}
                        </p>
                      ) : (
                        <ul className="mt-6 space-y-5 sm:space-y-6">
                          {slide.items.map((item) => (
                            <li
                              key={item.label}
                              className="text-base leading-relaxed text-stone-300 sm:text-lg"
                            >
                              <span className="font-semibold text-cream">
                                {item.label}
                              </span>
                              <span className="text-stone-500"> — </span>
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3"
            role="tablist"
            aria-label="Présentation gusEvent"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === current}
                onClick={() => setCurrent(index)}
                className={cn(
                  "shrink-0 border px-4 py-2 text-xs font-medium tracking-wide uppercase transition-colors sm:text-sm",
                  index === current
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-white/15 text-stone-400 hover:border-gold/40 hover:text-cream"
                )}
              >
                {slide.tab}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {slides.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1 w-8 rounded-full transition-colors duration-300",
                  index === current ? "bg-gold" : "bg-white/15"
                )}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
