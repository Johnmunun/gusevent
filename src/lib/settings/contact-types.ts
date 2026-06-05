import { brand } from "@/config/brand";
import { contact } from "@/config/contact";

export type ContactSettings = {
  email: string;
  phone: string;
  phoneDisplay: string;
  /** Numéro WhatsApp (ex. +21658778309) — lien wa.me généré automatiquement */
  whatsapp: string;
  addressLine1: string;
  addressLine2: string;
  instagram: string;
  linkedin: string;
  facebook: string;
};

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  email: contact.email,
  phone: contact.phone,
  phoneDisplay: contact.phoneDisplay,
  whatsapp: contact.phone,
  addressLine1: contact.address.line1,
  addressLine2: contact.address.line2,
  instagram: brand.instagram,
  linkedin: "",
  facebook: "",
};

export function mergeContactSettings(
  stored: Partial<ContactSettings> | null | undefined
): ContactSettings {
  return { ...DEFAULT_CONTACT_SETTINGS, ...stored };
}

export function whatsappLink(number: string) {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function telLinkFromPhone(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function mailtoDevisFromEmail(email: string) {
  return `mailto:${email}?subject=${encodeURIComponent("Demande de devis")}`;
}

export function socialLinksFromContact(settings: ContactSettings) {
  const links: { label: string; href: string }[] = [];
  if (settings.instagram.trim()) {
    links.push({ label: "Instagram", href: settings.instagram.trim() });
  }
  if (settings.linkedin.trim()) {
    links.push({ label: "LinkedIn", href: settings.linkedin.trim() });
  }
  if (settings.facebook.trim()) {
    links.push({ label: "Facebook", href: settings.facebook.trim() });
  }
  return links;
}
