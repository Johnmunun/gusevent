"use client";

import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { DevisButton } from "@/components/ui/DevisButton";
import { usePublicContact } from "@/components/contact/ContactProvider";
import { defaultLandingCms } from "@/lib/cms/defaults";
import type { CmsCtaContent } from "@/lib/cms/types";

type CtaProps = {
  content?: CmsCtaContent;
};

export function CTA({ content = defaultLandingCms.cta }: CtaProps) {
  const { phoneDisplay, email, telLink, mailtoDevis, whatsappHref } =
    usePublicContact();

  return (
    <section id="contact" className="section-padding bg-surface-elevated">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="grid overflow-hidden border border-border bg-surface lg:grid-cols-2"
        >
          <div className="flex flex-col justify-center p-10 sm:p-14 lg:p-16">
            <p className="label-upper">{content.eyebrow}</p>
            <div className="divider-gold mt-4 mb-8" />
            <h2 className="heading-section max-w-md">{content.title}</h2>
            <p className="mt-5 max-w-md text-muted leading-relaxed">
              {content.description}
            </p>
            <div className="mt-10">
              <DevisButton />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-8 border-t border-border bg-ink p-10 text-cream sm:p-14 lg:border-t-0 lg:border-l lg:p-16">
            <div>
              <p className="label-upper text-gold">{content.phoneLabel}</p>
              <a
                href={telLink}
                className="mt-2 block font-display text-2xl transition-colors hover:text-gold"
              >
                {phoneDisplay}
              </a>
            </div>
            <div>
              <p className="label-upper text-gold">{content.emailLabel}</p>
              <a
                href={mailtoDevis}
                className="mt-2 block text-lg transition-colors hover:text-gold"
              >
                {email}
              </a>
            </div>
            {whatsappHref ? (
              <div>
                <p className="label-upper text-gold">WhatsApp</p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-lg transition-colors hover:text-gold"
                >
                  Écrire sur WhatsApp
                </a>
              </div>
            ) : null}
            <div className="flex gap-6 pt-4">
              <Phone className="h-5 w-5 text-gold" />
              <Mail className="h-5 w-5 text-gold" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
