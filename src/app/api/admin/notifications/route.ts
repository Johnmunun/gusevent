import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.dashboard);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");

  const notifications = await prisma.adminNotification.findMany({
    where: {
      read: false,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const unreadCount = await prisma.adminNotification.count({
    where: { read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.dashboard);
  if (guard.error) return guard.error;

  const body = await request.json();
  const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
  const markAll = body.all === true;

  if (markAll) {
    await prisma.adminNotification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  } else if (ids.length > 0) {
    await prisma.adminNotification.updateMany({
      where: { id: { in: ids } },
      data: { read: true },
    });
  }

  const unreadCount = await prisma.adminNotification.count({
    where: { read: false },
  });

  return NextResponse.json({ ok: true, unreadCount });
}
