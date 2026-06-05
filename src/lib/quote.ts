import { contact } from "@/config/contact";

export const eventTypeOptions = [
  "Mariage",
  "Conférence",
  "Événement d'entreprise",
  "Concert",
  "Anniversaire",
  "Salon professionnel",
  "Surprise & moment magique",
  "Autre",
] as const;

/** 5 devises les plus utilisées pour les devis internationaux */
export const currencies = [
  { code: "TND", label: "Dinar tunisien", symbol: "DT" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "Dollar américain", symbol: "$" },
  { code: "GBP", label: "Livre sterling", symbol: "£" },
  { code: "MAD", label: "Dirham marocain", symbol: "MAD" },
] as const;

export type CurrencyCode = (typeof currencies)[number]["code"];

export type BudgetRangeId =
  | "tbd"
  | "lt5k"
  | "5k-15k"
  | "15k-30k"
  | "30k-50k"
  | "gt50k";

export const DEFAULT_CURRENCY: CurrencyCode = "TND";
export const DEFAULT_BUDGET: BudgetRangeId = "tbd";
export const DEFAULT_EVENT_TYPE = eventTypeOptions[0];

const budgetRangeDefs: { id: BudgetRangeId; template: string | null }[] = [
  { id: "tbd", template: null },
  { id: "lt5k", template: "Moins de {min}" },
  { id: "5k-15k", template: "{min} – {max}" },
  { id: "15k-30k", template: "{min} – {max}" },
  { id: "30k-50k", template: "{min} – {max}" },
  { id: "gt50k", template: "Plus de {min}" },
];

const rangeAmounts: Record<
  Exclude<BudgetRangeId, "tbd">,
  { min?: number; max?: number }
> = {
  lt5k: { max: 5000 },
  "5k-15k": { min: 5000, max: 15000 },
  "15k-30k": { min: 15000, max: 30000 },
  "30k-50k": { min: 30000, max: 50000 },
  gt50k: { min: 50000 },
};

function formatAmount(n: number): string {
  return n.toLocaleString("fr-FR");
}

function getCurrency(code: CurrencyCode) {
  return currencies.find((c) => c.code === code) ?? currencies[0];
}

export function getBudgetLabel(
  rangeId: BudgetRangeId,
  currencyCode: CurrencyCode
): string {
  const { symbol } = getCurrency(currencyCode);

  if (rangeId === "tbd") {
    return "À définir ensemble";
  }

  const def = budgetRangeDefs.find((r) => r.id === rangeId);
  const amounts = rangeAmounts[rangeId];
  if (!def?.template || !amounts) return "À définir ensemble";

  const withSymbol = (amount: number) => `${formatAmount(amount)} ${symbol}`;

  if (rangeId === "lt5k" && amounts.max) {
    return `Moins de ${withSymbol(amounts.max)}`;
  }
  if (rangeId === "gt50k" && amounts.min) {
    return `Plus de ${withSymbol(amounts.min)}`;
  }
  if (amounts.min && amounts.max) {
    return `${withSymbol(amounts.min)} – ${withSymbol(amounts.max)}`;
  }

  return "À définir ensemble";
}

export function getBudgetOptions(currencyCode: CurrencyCode) {
  return budgetRangeDefs.map((def) => ({
    id: def.id,
    label: getBudgetLabel(def.id, currencyCode),
  }));
}

export type QuoteFormData = {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  eventType: (typeof eventTypeOptions)[number];
  eventDate: string;
  guestCount: string;
  currency: CurrencyCode;
  budget: BudgetRangeId;
  location: string;
  message: string;
};

export function buildQuoteMailto(data: QuoteFormData): string {
  const currency = getCurrency(data.currency);
  const budgetLabel = getBudgetLabel(data.budget, data.currency);

  const subject = encodeURIComponent(
    `[Devis] ${data.eventType} — ${data.fullName}`
  );

  const lines = [
    "Bonjour,",
    "",
    "Je souhaite obtenir un devis pour mon événement.",
    "",
    "—— Coordonnées ——",
    `Nom : ${data.fullName}`,
    `Email : ${data.email}`,
    `Téléphone : ${data.phone}`,
    data.company ? `Société / organisation : ${data.company}` : null,
    "",
    "—— Projet ——",
    `Type d'événement : ${data.eventType}`,
    `Date souhaitée : ${data.eventDate || "À préciser"}`,
    `Nombre d'invités : ${data.guestCount || "À préciser"}`,
    `Devise : ${currency.label} (${currency.code})`,
    `Budget estimatif : ${budgetLabel}`,
    `Lieu : ${data.location || "À préciser"}`,
    "",
    "—— Détails ——",
    data.message || "(aucun message complémentaire)",
    "",
    "— Envoyé depuis le formulaire devis gusEvent",
  ].filter((line): line is string => line !== null);

  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:${contact.email}?subject=${subject}&body=${body}`;
}
