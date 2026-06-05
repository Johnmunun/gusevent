import { brand } from "@/config/brand";
import { getAppUrl } from "@/lib/quotes/service";

export function getSiteUrl() {
  return getAppUrl();
}

export const siteMetadataDefaults = {
  title: `${brand.name} — Agence événementielle premium`,
  description:
    "De la conception à la réalisation, nous transformons vos idées en expériences mémorables. Mariages, corporate, concerts et plus.",
  keywords: [
    "agence événementielle",
    "organisation événements",
    "mariage",
    "corporate",
    "Tunis",
    "gusEvent",
  ],
};
