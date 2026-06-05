import type { Metadata } from "next";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Demande de devis gratuit",
  description: `Décrivez votre événement et recevez une proposition personnalisée de ${brand.name} sous 24 heures.`,
  openGraph: {
    title: `Devis gratuit — ${brand.name}`,
    description: `Mariages, corporate, concerts : obtenez un devis sur mesure avec ${brand.name}.`,
  },
};

export default function DevisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
