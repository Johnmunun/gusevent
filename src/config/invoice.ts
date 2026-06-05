import { brand } from "@/config/brand";
import { contact } from "@/config/contact";

export const invoiceConfig = {
  issuerName: brand.legalName,
  issuerTagline: contact.address.line2,
  issuerAddress: contact.address.line1,
  issuerEmail: contact.email,
  issuerPhone: contact.phoneDisplay,
  defaultTaxRate: 19,
  taxLabel: "TVA",
  paymentTerms:
    "Paiement par virement sous 30 jours à réception de la facture.",
  bankDetails:
    "Coordonnées bancaires communiquées sur demande ou à compléter dans vos paramètres.",
  footerNote: `Merci pour votre confiance — ${brand.name}`,
} as const;
