import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { brand } from "@/config/brand";
import { Logo, type LogoBranding } from "@/components/ui/Logo";
import { defaultLandingCms } from "@/lib/cms/defaults";
import {
  DEFAULT_CONTACT_SETTINGS,
  socialLinksFromContact,
  telLinkFromPhone,
  mailtoDevisFromEmail,
  type ContactSettings,
} from "@/lib/settings/contact-types";
import type { CmsFooterContent } from "@/lib/cms/types";

type FooterProps = {
  content?: CmsFooterContent;
  branding?: LogoBranding;
  contact?: ContactSettings;
};

export function Footer({
  content = defaultLandingCms.footer,
  branding,
  contact,
}: FooterProps) {
  const c = contact ?? DEFAULT_CONTACT_SETTINGS;
  const email = c.email;
  const phoneDisplay = c.phoneDisplay;
  const telLink = telLinkFromPhone(c.phone);
  const mailtoDevis = mailtoDevisFromEmail(email);
  const socialLinks = socialLinksFromContact(c);

  return (
    <footer className="bg-ink text-stone-400">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="section-padding pb-12 pt-16">
        <div className="container-wide grid gap-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="light" branding={branding} showText={false} />
            <p className="mt-6 max-w-xs text-sm leading-relaxed">{content.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-widest uppercase transition-colors hover:text-gold"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="label-upper text-gold">Services</h3>
            <ul className="mt-6 space-y-3">
              {content.servicesLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="label-upper text-gold">Navigation</h3>
            <ul className="mt-6 space-y-3">
              {content.companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="label-upper text-gold">Contact</h3>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  {c.addressLine1}
                  <br />
                  {c.addressLine2}
                </span>
              </li>
              {phoneDisplay ? (
                <li className="flex gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-gold" />
                  <a href={telLink} className="hover:text-cream">
                    {phoneDisplay}
                  </a>
                </li>
              ) : null}
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <a href={mailtoDevis} className="hover:text-cream">
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="container-wide mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs tracking-wide sm:flex-row">
          <p>© {new Date().getFullYear()} {brand.name}. Tous droits réservés.</p>
          <div className="flex gap-8">
            <Link href="/mentions-legales" className="hover:text-gold">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-gold">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
