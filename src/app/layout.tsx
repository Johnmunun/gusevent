import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { brand } from "@/config/brand";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: `${brand.name} — Agence événementielle premium`,
  description:
    "De la conception à la réalisation, nous transformons vos idées en expériences mémorables. Mariages, corporate, concerts et plus.",
  keywords: [
    "agence événementielle",
    "organisation événements",
    "mariage",
    "corporate",
    "décoration événement",
  ],
  openGraph: {
    title: `${brand.name} — Événements inoubliables`,
    description:
      "Agence événementielle premium : organisation, décoration et gestion complète.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
