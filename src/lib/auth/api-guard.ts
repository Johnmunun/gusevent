import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/app-session";
import { hasPermission, type Permission } from "@/lib/auth/permissions";

export async function requireApiPermission(permission: Permission) {
  const session = await getAppSession();

  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Non authentifié ou accès panneau refusé" },
        { status: 401 }
      ),
    };
  }

  if (!hasPermission(session.user.role, session.user.permissions, permission)) {
    return {
      error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
    };
  }

  return { session };
}
