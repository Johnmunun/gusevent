import { createNeonAuth } from "@neondatabase/auth/next/server";

function getCookieSecret(): string {
  const secret =
    process.env.NEON_AUTH_COOKIE_SECRET ?? process.env.AUTH_SECRET ?? "";
  if (secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "development") {
    return "gusevent-dev-neon-auth-cookie-secret-32ch";
  }
  throw new Error(
    "NEON_AUTH_COOKIE_SECRET (min. 32 caractères) est requis. Générez avec: openssl rand -base64 32"
  );
}

const baseUrl = process.env.NEON_AUTH_BASE_URL;

export const auth = createNeonAuth({
  baseUrl: baseUrl ?? "https://placeholder.neonauth.local/auth",
  cookies: {
    secret: getCookieSecret(),
  },
});

export const isNeonAuthConfigured = Boolean(baseUrl);
