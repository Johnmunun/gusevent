import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdminRole } from "@prisma/client";

/**
 * Crée le compte Neon Auth + vérifie le profil Prisma (usage setup initial).
 * POST avec { email?, password?, name? } ou variables SEED_* dans .env
 */
export async function POST(request: Request) {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "NEON_AUTH_BASE_URL manquant" },
      { status: 500 }
    );
  }

  let body: { email?: string; password?: string; name?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* body optionnel */
  }

  const email = (body.email ?? process.env.SEED_ADMIN_EMAIL ?? "admin@gusevent.com")
    .toLowerCase()
    .trim();
  const password = body.password ?? process.env.SEED_ADMIN_PASSWORD;
  const name = body.name ?? process.env.SEED_ADMIN_NAME ?? "Administrateur";

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Mot de passe requis (min. 8 caractères)" },
      { status: 400 }
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    request.headers.get("origin") ??
    "http://localhost:3000";

  const signUpRes = await fetch(`${baseUrl}/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify({ email, password, name }),
  });

  const signUpJson = await signUpRes.json().catch(() => ({}));

  if (!signUpRes.ok) {
    const msg =
      (signUpJson as { message?: string }).message ??
      `Neon Auth sign-up: HTTP ${signUpRes.status}`;
    if (
      signUpRes.status === 400 &&
      /already|exist/i.test(msg)
    ) {
      /* compte déjà présent — on continue */
    } else {
      return NextResponse.json({ error: msg }, { status: signUpRes.status });
    }
  }

  const neonUserId = (signUpJson as { user?: { id?: string } })?.user?.id;

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      role: AdminRole.SUPER_ADMIN,
      permissions: [],
      active: true,
      neonAuthId: neonUserId ?? null,
    },
    update: {
      name,
      role: AdminRole.SUPER_ADMIN,
      active: true,
      ...(neonUserId ? { neonAuthId: neonUserId } : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    email,
    message:
      "Compte Neon Auth prêt. Connectez-vous avec cet email et ce mot de passe sur /admin/login.",
  });
}
