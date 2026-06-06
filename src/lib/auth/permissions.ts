import type { AdminRole } from "@prisma/client";

export const PERMISSIONS = {
  dashboard: "dashboard.view",
  clients: "clients.view",
  clientsEdit: "clients.edit",
  pipeline: "pipeline.view",
  devis: "devis.view",
  events: "events.view",
  calendar: "calendar.view",
  tasks: "tasks.view",
  analytics: "analytics.view",
  portfolio: "portfolio.view",
  marketing: "marketing.view",
  cms: "cms.view",
  cmsEdit: "cms.edit",
  users: "users.manage",
  settings: "settings.manage",
  hr: "hr.view",
  hrEdit: "hr.edit",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.dashboard,
    PERMISSIONS.clients,
    PERMISSIONS.clientsEdit,
    PERMISSIONS.pipeline,
    PERMISSIONS.devis,
    PERMISSIONS.events,
    PERMISSIONS.calendar,
    PERMISSIONS.tasks,
    PERMISSIONS.analytics,
    PERMISSIONS.portfolio,
    PERMISSIONS.marketing,
    PERMISSIONS.cms,
    PERMISSIONS.cmsEdit,
    PERMISSIONS.settings,
    PERMISSIONS.hr,
    PERMISSIONS.hrEdit,
  ],
  EDITOR: [
    PERMISSIONS.dashboard,
    PERMISSIONS.cms,
    PERMISSIONS.cmsEdit,
    PERMISSIONS.portfolio,
    PERMISSIONS.marketing,
  ],
  VIEWER: [PERMISSIONS.dashboard, PERMISSIONS.cms],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super administrateur",
  ADMIN: "Administrateur",
  EDITOR: "Éditeur contenu",
  VIEWER: "Lecture seule",
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Accès complet, gestion des utilisateurs et de la sécurité.",
  ADMIN: "CRM, production, analytics et CMS — sans gestion des comptes.",
  EDITOR: "Modification du site public (CMS) et portfolio.",
  VIEWER: "Consultation du tableau de bord et aperçu CMS.",
};

export function resolvePermissions(
  role: AdminRole,
  extra: string[] = []
): Set<string> {
  const base = new Set<string>(ROLE_PERMISSIONS[role]);
  for (const p of extra) {
    if (p) base.add(p);
  }
  return base;
}

export function hasPermission(
  role: AdminRole,
  extra: string[],
  permission: Permission
): boolean {
  if (role === "SUPER_ADMIN") return true;
  const perms = resolvePermissions(role, extra);
  return perms.has(permission);
}

export function canAccessAdmin(role: AdminRole, extra: string[]): boolean {
  return resolvePermissions(role, extra).has(PERMISSIONS.dashboard);
}
