"use client";

import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DevisButton } from "@/components/ui/DevisButton";
import { HeroMobileImage } from "@/components/landing/HeroMobileImage";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { HeroBackground } from "@/components/landing/HeroBackground";
import { usePublicContact } from "@/components/contact/ContactProvider";
import { StatWithBackdrop } from "@/components/ui/StatWithBackdrop";
import type { CmsHeroContent, CmsStatItem } from "@/lib/cms/types";
import { defaultLandingCms } from "@/lib/cms/defaults";

type HeroProps = {
  content?: CmsHeroContent;
  stats?: CmsStatItem[];
};

export function Hero({
  content = defaultLandingCms.hero,
  stats = defaultLandingCms.stats,
}: HeroProps) {
  const { email, phoneDisplay, telLink, mailtoDevis } = usePublicContact();

  return (
    <section className="relative isolate w-full max-w-[100vw] overflow-x-clip bg-ink">
      <HeroBackground content={content} />

      {/* Contenu */}
      <div className="relative z-10 mx-auto w-full min-w-0 max-w-[82rem] box-border px-4 pb-24 pt-[calc(4.5rem+1.25rem)] sm:px-6 sm:pb-28 sm:pt-[calc(4.5rem+2rem)] md:px-8 md:pb-32 md:pt-32 lg:flex lg:min-h-screen lg:items-center lg:px-12 lg:pt-36 xl:px-16">
        <div className="grid w-full min-w-0 max-w-full items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div className="min-w-0 w-full max-w-full lg:max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="label-upper break-words text-gold"
            >
              {content.eyebrow}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-3 font-display text-[1.65rem] font-medium leading-[1.12] tracking-tight text-cream min-[400px]:text-3xl sm:mt-4 sm:text-4xl sm:leading-[1.1] md:text-5xl lg:text-[3.5rem] xl:text-[4rem]"
            >
              {content.titleBefore}
              <span className="italic text-gold">{content.titleHighlight}</span>
              {content.titleAfter}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="mt-4 text-sm leading-relaxed text-stone-300 sm:mt-6 sm:text-base md:text-lg"
            >
              {content.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="mt-6 flex w-full min-w-0 flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <DevisButton
                wrapClassName="w-full sm:w-auto"
                className="w-full justify-center sm:w-auto"
              />
              <Button
                href={content.ctaSecondaryHref}
                variant="outline-light"
                size="lg"
                className="w-full justify-center sm:w-auto"
              >
                {content.ctaSecondaryLabel}
              </Button>
            </motion.div>

            <HeroMobileImage />

            {/* Stats — mobile : défilement sans débordement page */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-8 w-full min-w-0 border-t border-white/10 pt-6 md:mt-10 md:pt-8"
            >
              <div className="scroll-strip -mx-1 max-w-full px-1 md:mx-0 md:grid md:max-w-full md:grid-cols-2 md:gap-6 md:overflow-x-clip lg:grid-cols-4">
                {stats.map((stat) => (
                  <StatWithBackdrop
                    key={stat.label}
                    value={stat.value}
                    suffix={stat.suffix}
                    label={stat.label}
                    backdrop={"backdrop" in stat ? stat.backdrop : undefined}
                    theme="dark"
                    className="min-w-[9.5rem] shrink-0 snap-start md:min-w-0"
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-6 hidden flex-wrap gap-6 md:flex"
            >
              <a
                href={telLink}
                className="inline-flex min-w-0 items-center gap-2 text-sm text-stone-400 hover:text-gold"
              >
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <span className="truncate">{phoneDisplay}</span>
              </a>
              <a
                href={mailtoDevis}
                className="inline-flex min-w-0 items-center gap-2 text-sm text-stone-400 hover:text-gold"
              >
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <span className="break-all">{email}</span>
              </a>
            </motion.div>
          </div>

          <div className="hidden min-w-0 lg:block">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
