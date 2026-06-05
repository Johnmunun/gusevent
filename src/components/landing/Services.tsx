"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getServiceIcon } from "@/lib/cms/service-icons";
import { defaultLandingCms } from "@/lib/cms/defaults";
import type { CmsServicesContent } from "@/lib/cms/types";

type ServicesProps = {
  content?: CmsServicesContent;
};

export function Services({ content = defaultLandingCms.services }: ServicesProps) {
  return (
    <section id="services" className="section-padding bg-cream">
      <div className="container-wide">
        <SectionHeading
          align="left"
          eyebrow={content.heading.eyebrow}
          title={content.heading.title}
          description={content.heading.description}
        />

        <div className="mt-10 divide-y divide-border border-y border-border md:mt-20">
          {content.items.map((service, index) => {
            const Icon = getServiceIcon(service.iconKey);
            const num = String(index + 1).padStart(2, "0");

            return (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ x: 6 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className="group grid gap-4 py-7 transition-colors hover:bg-surface/60 sm:gap-6 sm:py-10 md:grid-cols-[5rem_3rem_1fr] md:items-start md:gap-10 md:py-12 md:px-6"
              >
                <span className="font-display text-4xl text-gold/40 transition-colors group-hover:text-gold md:text-5xl">
                  {num}
                </span>
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="flex h-12 w-12 items-center justify-center border border-border bg-surface text-foreground transition-colors group-hover:border-gold/50 group-hover:text-gold"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.25} />
                </motion.div>
                <div>
                  <h3 className="font-display text-2xl font-medium text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                    {service.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
