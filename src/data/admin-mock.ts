export type ClientStatus = "prospect" | "devis" | "confirme" | "termine";

export const clientStatusLabels: Record<ClientStatus, string> = {
  prospect: "Prospect",
  devis: "Devis envoyé",
  confirme: "Confirmé",
  termine: "Terminé",
};

export const clientStatusStyles: Record<ClientStatus, string> = {
  prospect: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
  devis: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  confirme: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  termine: "bg-ink/5 text-muted ring-1 ring-border",
};

export type MockClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  budget: string;
  status: ClientStatus;
  createdAt: string;
  priority?: "haute" | "normale";
};

export const mockClients: MockClient[] = [
  {
    id: "cl_001",
    name: "Sophie Martin",
    email: "sophie.martin@email.com",
    phone: "+216 22 111 222",
    eventType: "Mariage",
    eventDate: "2026-09-15",
    budget: "15 000 – 30 000 DT",
    status: "devis",
    createdAt: "2026-06-02",
    priority: "haute",
  },
  {
    id: "cl_002",
    name: "Karim Benali",
    email: "karim.b@entreprise.tn",
    phone: "+216 98 333 444",
    eventType: "Événement d'entreprise",
    eventDate: "2026-07-20",
    budget: "5 000 – 15 000 DT",
    status: "confirme",
    createdAt: "2026-05-28",
    priority: "haute",
  },
  {
    id: "cl_003",
    name: "Élise Dubois",
    email: "elise.dubois@email.com",
    phone: "+216 55 777 888",
    eventType: "Anniversaire",
    eventDate: "2026-08-03",
    budget: "À définir",
    status: "prospect",
    createdAt: "2026-06-03",
  },
  {
    id: "cl_004",
    name: "Youssef Trabelsi",
    email: "y.trabelsi@email.com",
    phone: "+216 20 999 101",
    eventType: "Surprise & moment magique",
    eventDate: "2026-06-18",
    budget: "< 5 000 DT",
    status: "devis",
    createdAt: "2026-06-01",
    priority: "haute",
  },
  {
    id: "cl_005",
    name: "Mélanie Costa",
    email: "melanie.costa@corp.com",
    phone: "+216 58 222 333",
    eventType: "Conférence",
    eventDate: "2025-11-10",
    budget: "30 000 – 50 000 DT",
    status: "termine",
    createdAt: "2025-09-12",
  },
  {
    id: "cl_006",
    name: "Amira Gharbi",
    email: "amira.gharbi@email.com",
    phone: "+216 27 444 555",
    eventType: "Mariage",
    eventDate: "2026-10-22",
    budget: "15 000 – 30 000 DT",
    status: "prospect",
    createdAt: "2026-06-04",
  },
];

export const adminDashboardStats = [
  {
    label: "Chiffre prévisionnel",
    value: "48 200",
    suffix: " DT",
    hint: "+18 % vs mois dernier",
    trend: "up" as const,
  },
  {
    label: "Devis en attente",
    value: "4",
    hint: "2 priorité haute",
    trend: "neutral" as const,
  },
  {
    label: "Événements à venir",
    value: "3",
    hint: "Dans les 60 prochains jours",
    trend: "up" as const,
  },
  {
    label: "Taux conversion",
    value: "62",
    suffix: " %",
    hint: "Prospect → confirmé",
    trend: "up" as const,
  },
  {
    label: "Clients actifs",
    value: "12",
    hint: "+2 ce mois",
    trend: "up" as const,
  },
  {
    label: "Satisfaction",
    value: "4.9",
    suffix: "/5",
    hint: "Derniers événements",
    trend: "up" as const,
  },
];

export const pipelineColumns = [
  {
    id: "prospect",
    title: "Prospects",
    color: "border-stone-300",
    clients: mockClients.filter((c) => c.status === "prospect"),
  },
  {
    id: "devis",
    title: "Devis envoyé",
    color: "border-amber-300",
    clients: mockClients.filter((c) => c.status === "devis"),
  },
  {
    id: "confirme",
    title: "Confirmés",
    color: "border-emerald-300",
    clients: mockClients.filter((c) => c.status === "confirme"),
  },
  {
    id: "termine",
    title: "Terminés",
    color: "border-border",
    clients: mockClients.filter((c) => c.status === "termine"),
  },
] as const;

export const mockDevisRequests = [
  {
    id: "dv_01",
    name: "Élise Dubois",
    eventType: "Anniversaire",
    budget: "À définir",
    date: "2026-06-03",
    urgency: "normal",
  },
  {
    id: "dv_02",
    name: "Youssef Trabelsi",
    eventType: "Surprise & moment magique",
    budget: "< 5 000 DT",
    date: "2026-06-01",
    urgency: "high",
  },
  {
    id: "dv_03",
    name: "Amira Gharbi",
    eventType: "Mariage",
    budget: "15 000 – 30 000 DT",
    date: "2026-06-04",
    urgency: "high",
  },
  {
    id: "dv_04",
    name: "Romain Pellet",
    eventType: "Corporate",
    budget: "5 000 – 15 000 DT",
    date: "2026-05-30",
    urgency: "normal",
  },
];

export const mockEvents = [
  {
    id: "ev_1",
    title: "Mariage Sophie & James",
    client: "Sophie Martin",
    date: "2026-09-15",
    location: "Domaine la Roseraie",
    status: "preparation",
  },
  {
    id: "ev_2",
    title: "Gala corporate TechSummit",
    client: "Karim Benali",
    date: "2026-07-20",
    location: "Hôtel Mövenpick",
    status: "confirme",
  },
  {
    id: "ev_3",
    title: "Surprise anniversaire",
    client: "Youssef Trabelsi",
    date: "2026-06-18",
    location: "Résidence familiale",
    status: "urgent",
  },
];

export const mockTasks = [
  { id: "t1", title: "Envoyer devis Sophie Martin", due: "Aujourd'hui", done: false, assignee: "G" },
  { id: "t2", title: "Repérage lieu gala corporate", due: "Demain", done: false, assignee: "Équipe" },
  { id: "t3", title: "Valider décor surprise 18/06", due: "12 juin", done: true, assignee: "G" },
  { id: "t4", title: "Publier 2 photos portfolio", due: "Cette semaine", done: false, assignee: "G" },
  { id: "t5", title: "Relance Amira Gharbi", due: "15 juin", done: false, assignee: "G" },
  { id: "t6", title: "Brief prestataire traiteur", due: "20 juin", done: false, assignee: "Équipe" },
];

export const mockActivities = [
  { id: "a1", text: "Nouvelle demande devis — Amira Gharbi", time: "Il y a 2 h", type: "devis" },
  { id: "a2", text: "Karim Benali a confirmé le gala corporate", time: "Hier", type: "success" },
  { id: "a3", text: "Rappel : surprise Youssef le 18/06", time: "Hier", type: "alert" },
  { id: "a4", text: "Portfolio mis à jour (3 photos)", time: "2 jours", type: "info" },
];

export const revenueByMonth = [
  { month: "Jan", amount: 12 },
  { month: "Fév", amount: 18 },
  { month: "Mar", amount: 15 },
  { month: "Avr", amount: 22 },
  { month: "Mai", amount: 28 },
  { month: "Juin", amount: 35 },
];

export const leadsByMonth = [
  { month: "Jan", count: 8 },
  { month: "Fév", count: 12 },
  { month: "Mar", count: 10 },
  { month: "Avr", count: 14 },
  { month: "Mai", count: 16 },
  { month: "Juin", count: 18 },
];

export const eventTypeBreakdown = [
  { type: "Mariages", pct: 42 },
  { type: "Corporate", pct: 28 },
  { type: "Surprises", pct: 15 },
  { type: "Autres", pct: 15 },
];

export const quickActions = [
  { label: "Nouveau client", href: "/admin/clients" },
  { label: "Créer un devis", href: "/admin/devis" },
  { label: "Planifier événement", href: "/admin/evenements" },
  { label: "Voir calendrier", href: "/admin/calendrier" },
];
