import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Réduit les erreurs HMR / React Client Manifest liées aux devtools (15.5+)
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Évite les erreurs d'optimisation sur fichiers locaux /media
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
