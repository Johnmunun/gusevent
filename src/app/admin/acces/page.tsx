import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import {
  PERMISSIONS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from "@/lib/auth/permissions";
import type { AdminRole } from "@prisma/client";

const roles: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"];

const permissionLabels: Record<string, string> = {
  [PERMISSIONS.dashboard]: "Tableau de bord",
  [PERMISSIONS.cms]: "CMS (lecture)",
  [PERMISSIONS.cmsEdit]: "CMS (édition)",
  [PERMISSIONS.clients]: "Clients",
  [PERMISSIONS.clientsEdit]: "Clients (édition)",
  [PERMISSIONS.pipeline]: "Pipeline",
  [PERMISSIONS.devis]: "Devis",
  [PERMISSIONS.events]: "Événements",
  [PERMISSIONS.calendar]: "Calendrier",
  [PERMISSIONS.tasks]: "Tâches",
  [PERMISSIONS.analytics]: "Analytics",
  [PERMISSIONS.portfolio]: "Portfolio",
  [PERMISSIONS.marketing]: "Marketing",
  [PERMISSIONS.users]: "Utilisateurs & accès",
  [PERMISSIONS.settings]: "Paramètres",
};

export default function AdminAccessPage() {
  return (
    <AdminShell
      title="Rôles & accès"
      description="Matrice des permissions par rôle. Assignez un rôle à chaque utilisateur lors de la création."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {roles.map((role) => (
          <AdminCard key={role} title={ROLE_LABELS[role]}>
            <p className="text-sm text-muted leading-relaxed">
              {ROLE_DESCRIPTIONS[role]}
            </p>
            <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
              {ROLE_PERMISSIONS[role].map((perm) => (
                <li key={perm} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 bg-gold" />
                  {permissionLabels[perm] ?? perm}
                </li>
              ))}
            </ul>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
