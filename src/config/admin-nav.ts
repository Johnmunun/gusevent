import {
  BarChart3,
  CalendarDays,
  FileText,
  Image,
  Kanban,
  LayoutDashboard,
  PartyPopper,
  Settings,
  Users,
  CheckSquare,
  ExternalLink,
  Sparkles,
  Shield,
  UserCog,
  Layout,
  MessageSquare,
  IdCard,
} from "lucide-react";
import { PERMISSIONS, type Permission } from "@/lib/auth/permissions";

export type DynamicBadgeKey =
  | "clients"
  | "pendingQuotes"
  | "pipeline"
  | "tasks";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: string;
  dynamicBadge?: DynamicBadgeKey;
  permission?: Permission;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [
      {
        label: "Tableau de bord",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
        permission: PERMISSIONS.dashboard,
      },
    ],
  },
  {
    title: "Site web",
    items: [
      {
        label: "CMS — Contenu",
        href: "/admin/cms",
        icon: Layout,
        permission: PERMISSIONS.cms,
      },
      {
        label: "Portfolio",
        href: "/admin/portfolio",
        icon: Image,
        permission: PERMISSIONS.portfolio,
      },
    ],
  },
  {
    title: "Commercial",
    items: [
      {
        label: "Clients",
        href: "/admin/clients",
        icon: Users,
        dynamicBadge: "clients",
        permission: PERMISSIONS.clients,
      },
      {
        label: "Pipeline ventes",
        href: "/admin/pipeline",
        icon: Kanban,
        dynamicBadge: "pipeline",
        permission: PERMISSIONS.pipeline,
      },
      {
        label: "Demandes devis",
        href: "/admin/devis",
        icon: FileText,
        dynamicBadge: "pendingQuotes",
        permission: PERMISSIONS.devis,
      },
      {
        label: "Témoignages clients",
        href: "/admin/temoignages",
        icon: MessageSquare,
        permission: PERMISSIONS.devis,
      },
    ],
  },
  {
    title: "Production",
    items: [
      {
        label: "Événements",
        href: "/admin/evenements",
        icon: PartyPopper,
        permission: PERMISSIONS.events,
      },
      {
        label: "Calendrier",
        href: "/admin/calendrier",
        icon: CalendarDays,
        permission: PERMISSIONS.calendar,
      },
      {
        label: "Tâches équipe",
        href: "/admin/taches",
        icon: CheckSquare,
        dynamicBadge: "tasks",
        permission: PERMISSIONS.tasks,
      },
    ],
  },
  {
    title: "Croissance",
    items: [
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        permission: PERMISSIONS.analytics,
      },
      {
        label: "Marketing",
        href: "/admin/marketing",
        icon: Sparkles,
        permission: PERMISSIONS.marketing,
      },
    ],
  },
  {
    title: "Équipe",
    items: [
      {
        label: "RH — Employés",
        href: "/admin/rh",
        icon: IdCard,
        permission: PERMISSIONS.hr,
      },
    ],
  },
  {
    title: "Système",
    items: [
      {
        label: "Utilisateurs",
        href: "/admin/utilisateurs",
        icon: UserCog,
        permission: PERMISSIONS.users,
      },
      {
        label: "Rôles & accès",
        href: "/admin/acces",
        icon: Shield,
        permission: PERMISSIONS.users,
      },
      {
        label: "Paramètres",
        href: "/admin/settings",
        icon: Settings,
        permission: PERMISSIONS.settings,
      },
    ],
  },
];

export const adminFooterLink = {
  label: "Voir le site public",
  href: "/",
  icon: ExternalLink,
} as const;
