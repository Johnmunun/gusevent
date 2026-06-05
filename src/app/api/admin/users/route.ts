import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.users);
  if (guard.error) return guard.error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      neonAuthId: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.users);
  if (guard.error) return guard.error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { email, password, name, role, permissions, active } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const exists = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (exists) {
    return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
  }

  const { data: signUpData, error: signUpError } = await auth.signUp.email({
    email: normalizedEmail,
    password,
    name,
  });

  if (signUpError) {
    return NextResponse.json(
      { error: signUpError.message ?? "Impossible de créer le compte Neon Auth" },
      { status: 400 }
    );
  }

  const neonUserId = signUpData?.user?.id;

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name,
      role,
      permissions: permissions ?? [],
      active: active ?? true,
      neonAuthId: neonUserId ?? null,
    },
    select: {
      id: true,
      neonAuthId: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
