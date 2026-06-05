import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";

const updateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]).optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiPermission(PERMISSIONS.users);
  if (guard.error) return guard.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const data = { ...parsed.data };
  if (parsed.data.email) {
    data.email = parsed.data.email.toLowerCase().trim();
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      neonAuthId: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      active: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiPermission(PERMISSIONS.users);
  if (guard.error) return guard.error;

  const { id } = await params;

  if (guard.session?.user.id === id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte" },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
