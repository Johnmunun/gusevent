import { PERMISSIONS } from "@/lib/auth/permissions";

export const PERMISSION_LABELS: Record<string, string> = {
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
  [PERMISSIONS.hr]: "RH (lecture)",
  [PERMISSIONS.hrEdit]: "RH (édition)",
};
