import type { AdminRole } from "@prisma/client";
import {
  adminNavGroups,
  type AdminNavGroup,
  type AdminNavItem,
} from "@/config/admin-nav";
import { hasPermission } from "@/lib/auth/permissions";

export function filterAdminNav(
  role: AdminRole,
  extra: string[]
): AdminNavGroup[] {
  return adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true;
        return hasPermission(role, extra, item.permission);
      }),
    }))
    .filter((group) => group.items.length > 0);
}

export function canSeeNavItem(
  role: AdminRole,
  extra: string[],
  item: AdminNavItem
): boolean {
  if (!item.permission) return true;
  return hasPermission(role, extra, item.permission);
}
