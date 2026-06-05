import type { AdminRole } from "@prisma/client";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import {
  canAccessAdmin,
  hasPermission,
  type Permission,
} from "@/lib/auth/permissions";

export type AppSessionUser = {
  id: string;
  neonAuthId: string | null;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
};

export type AppSession = {
  neonUser: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
  user: AppSessionUser;
};

export async function getNeonSession() {
  const { data, error } = await auth.getSession();
  if (error || !data?.user) return null;
  return data;
}

export async function getAppSession(): Promise<AppSession | null> {
  const neonSession = await getNeonSession();
  if (!neonSession?.user?.email) return null;

  const email = neonSession.user.email.toLowerCase().trim();
  let appUser = await prisma.user.findUnique({ where: { email } });

  if (!appUser) {
    return null;
  }

  if (!appUser.neonAuthId && neonSession.user.id) {
    appUser = await prisma.user.update({
      where: { id: appUser.id },
      data: { neonAuthId: neonSession.user.id },
    });
  }

  if (!appUser.active || !canAccessAdmin(appUser.role, appUser.permissions)) {
    return null;
  }

  return {
    neonUser: {
      id: neonSession.user.id,
      email: neonSession.user.email,
      name: neonSession.user.name,
      image: neonSession.user.image,
    },
    user: {
      id: appUser.id,
      neonAuthId: appUser.neonAuthId,
      email: appUser.email,
      name: appUser.name,
      role: appUser.role,
      permissions: appUser.permissions,
    },
  };
}

export async function requireAppSession() {
  const session = await getAppSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export function appSessionCan(
  session: AppSession,
  permission: Permission
): boolean {
  return hasPermission(
    session.user.role,
    session.user.permissions,
    permission
  );
}
