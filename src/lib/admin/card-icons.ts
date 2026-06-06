import {
  Activity,
  AlertCircle,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Cloud,
  Contact,
  FileText,
  FolderOpen,
  GitBranch,
  HardDrive,
  Image,
  Inbox,
  Info,
  KeyRound,
  Layers,
  LayoutGrid,
  Lightbulb,
  Mail,
  MailCheck,
  Megaphone,
  MessageSquareQuote,
  PanelBottom,
  PenLine,
  Percent,
  Phone,
  PieChart,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Tags,
  TrendingUp,
  Type,
  UserCog,
  Wallet,
  UserPlus,
  Users,
  ListTodo,
  type LucideIcon,
} from "lucide-react";

const STAT_ICON_RULES: { match: (label: string) => boolean; icon: LucideIcon }[] = [
  { match: (l) => l.includes("chiffre") || l.includes("ca mensuel"), icon: Wallet },
  { match: (l) => l.includes("panier"), icon: ShoppingBag },
  { match: (l) => l.includes("devis") || l.includes("nouvelles"), icon: Inbox },
  { match: (l) => l.includes("événement"), icon: Calendar },
  { match: (l) => l.includes("conversion") || l.includes("taux"), icon: Percent },
  { match: (l) => l.includes("client") || l.includes("contact"), icon: Users },
  { match: (l) => l.includes("lead") || l.includes("demande"), icon: UserPlus },
  { match: (l) => l.includes("section"), icon: LayoutGrid },
  { match: (l) => l.includes("personnalis"), icon: PenLine },
  { match: (l) => l.includes("dernière") || l.includes("maj"), icon: Clock },
  { match: (l) => l.includes("priorité"), icon: AlertCircle },
  { match: (l) => l.includes("confirm"), icon: CheckCircle2 },
  { match: (l) => l.includes("email"), icon: MailCheck },
  { match: (l) => l.includes("projet"), icon: FolderOpen },
  { match: (l) => l.includes("cloudinary"), icon: Cloud },
  { match: (l) => l.includes("média") || l.includes("media"), icon: HardDrive },
  { match: (l) => l.includes("catégor"), icon: Tags },
  { match: (l) => l.includes("actif"), icon: TrendingUp },
  { match: (l) => l.includes("administrateur"), icon: Shield },
  { match: (l) => l.includes("éditeur"), icon: PenLine },
  { match: (l) => l.includes("utilisateur"), icon: UserCog },
  { match: (l) => l.includes("total"), icon: Layers },
];

export function getStatCardIcon(label: string): LucideIcon {
  const normalized = label.toLowerCase();
  for (const rule of STAT_ICON_RULES) {
    if (rule.match(normalized)) return rule.icon;
  }
  return BarChart3;
}

const CMS_SECTION_ICONS: Record<string, LucideIcon> = {
  hero: Sparkles,
  stats: BarChart3,
  services: Briefcase,
  gallery: Image,
  testimonials: MessageSquareQuote,
  about: Info,
  cta: Phone,
  footer: PanelBottom,
};

export function getCmsSectionIcon(slug: string): LucideIcon {
  return CMS_SECTION_ICONS[slug] ?? LayoutGrid;
}

const ROLE_ICONS: Record<string, LucideIcon> = {
  SUPER_ADMIN: Shield,
  ADMIN: KeyRound,
  EDITOR: PenLine,
  VIEWER: Users,
};

export function getRoleCardIcon(role: string): LucideIcon {
  return ROLE_ICONS[role] ?? Shield;
}

export const ADMIN_CARD_ICONS = {
  revenue: Wallet,
  leads: TrendingUp,
  pipeline: GitBranch,
  eventTypes: PieChart,
  conversion: Percent,
  upcomingEvents: Calendar,
  tasks: CheckCircle2,
  activity: Activity,
  recentClients: Users,
  contentIdeas: Lightbulb,
  nurtureLeads: Megaphone,
  logo: Image,
  contact: Contact,
  identity: Sparkles,
  contactPublic: Phone,
  system: Settings,
  email: Mail,
  security: Shield,
  hrPayroll: Wallet,
  accounts: UserCog,
  queue: FileText,
  storage: Cloud,
  calendar: Calendar,
  tasksPending: ListTodo,
  tasksDone: CheckCircle2,
  galleryText: Type,
} as const;
