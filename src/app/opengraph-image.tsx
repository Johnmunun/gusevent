import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

export const alt = `${brand.name} — Agence événementielle`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#c9a962",
            marginBottom: 24,
          }}
        >
          Agence événementielle
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: "#fafaf9",
            fontFamily: "Georgia, serif",
            lineHeight: 1.1,
          }}
        >
          {brand.name}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: "#a8a29e",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Mariages · Corporate · Concerts · Expériences sur mesure
        </div>
      </div>
    ),
    { ...size }
  );
}
