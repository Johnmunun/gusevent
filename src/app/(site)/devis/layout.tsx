import type { Metadata } from "next";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: `Demande de devis — ${brand.name}`,
  description:
    "Obtenez un devis personnalisé pour votre mariage, événement corporate, concert ou surprise. Réponse sous 24 heures.",
};

export default function DevisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
