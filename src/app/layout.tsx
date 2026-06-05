import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { brand } from "@/config/brand";
import { getSiteUrl, siteMetadataDefaults } from "@/lib/site/metadata";
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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteMetadataDefaults.title,
    template: `%s — ${brand.name}`,
  },
  description: siteMetadataDefaults.description,
  keywords: siteMetadataDefaults.keywords,
  openGraph: {
    title: `${brand.name} — Événements inoubliables`,
    description: siteMetadataDefaults.description,
    type: "website",
    locale: "fr_FR",
    siteName: brand.name,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — Événements inoubliables`,
    description: siteMetadataDefaults.description,
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
