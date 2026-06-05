import {
  Building2,
  Cake,
  DoorOpen,
  Heart,
  Mic2,
  Music,
  PartyPopper,
} from "lucide-react";
import { media, mediaFallback } from "@/config/media";

export type GalleryCategory =
  | "all"
  | "mariages"
  | "corporate"
  | "concerts"
  | "conferences";

function galleryEntry(
  index: number,
  title: string,
  category: Exclude<GalleryCategory, "all">,
  span: "tall" | "wide" | "normal"
) {
  return {
    id: String(index),
    title,
    category,
    image: media.gallery(index),
    sources: media.gallerySources(index),
    span,
  };
}

export const stats = [
  { label: "Projets réalisés", value: 8, suffix: "", backdrop: "8" },
  { label: "Clients satisfaits", value: 620, suffix: "+" },
  { label: "Depuis", value: 2023, suffix: "" },
  { label: "Partenaires", value: 45, suffix: "+" },
] as const;

export const services = [
  {
    title: "Mariages",
    description:
      "Cérémonies élégantes et réceptions sur mesure, pensées dans les moindres détails pour un jour inoubliable.",
    icon: Heart,
  },
  {
    title: "Conférences",
    description:
      "Scénographie, logistique et expérience participant pour des événements professionnels impeccables.",
    icon: Mic2,
  },
  {
    title: "Événements d'entreprise",
    description:
      "Séminaires, lancements produits et team building avec une image de marque soignée et cohérente.",
    icon: Building2,
  },
  {
    title: "Concerts",
    description:
      "Production technique, scène et ambiance pour des spectacles vivants mémorables.",
    icon: Music,
  },
  {
    title: "Anniversaires",
    description:
      "Fêtes privées personnalisées, de l'intime au grandiose, avec une touche créative unique.",
    icon: Cake,
  },
  {
    title: "Salons professionnels",
    description:
      "Stands, parcours visiteurs et coordination complète pour maximiser votre impact.",
    icon: PartyPopper,
  },
  {
    title: "Surprises & moments magiques",
    description:
      "Toc à la porte, mots doux personnalisés selon votre histoire : nous orchestrons des apparitions discrètes, dans l'ombre, pour des surprises qui marquent les cœurs — anniversaires, demandes en mariage, retrouvailles ou hommages sur mesure.",
    icon: DoorOpen,
  },
] as const;

export const galleryItems = [
  galleryEntry(1, "Réception champêtre", "mariages", "tall"),
  galleryEntry(2, "Gala corporate", "corporate", "wide"),
  galleryEntry(3, "Scène live", "concerts", "normal"),
  galleryEntry(4, "Sommet leadership", "conferences", "normal"),
  galleryEntry(5, "Décoration florale", "mariages", "normal"),
  galleryEntry(6, "Networking lounge", "corporate", "tall"),
  galleryEntry(7, "Festival nocturne", "concerts", "wide"),
  galleryEntry(8, "Convention & gala", "conferences", "normal"),
] as const;

export const projectCount = galleryItems.length;

export const galleryFilters: { id: GalleryCategory; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "mariages", label: "Mariages" },
  { id: "corporate", label: "Corporate" },
  { id: "concerts", label: "Concerts" },
  { id: "conferences", label: "Conférences" },
];

export const testimonials = [
  {
    id: "1",
    name: "Sophie Martin",
    role: "Directrice Marketing",
    company: "Lumière & Co",
    quote:
      "Une équipe exceptionnelle qui a su transformer notre vision en une expérience corporate fluide et mémorable. Chaque détail était maîtrisé.",
    image: media.testimonial(1),
    fallback: mediaFallback.testimonial,
  },
  {
    id: "2",
    name: "Karim Benali",
    role: "Marié",
    company: "Mariage — Marrakech",
    quote:
      "Notre mariage était un rêve éveillé. La décoration, la coordination et l'ambiance ont dépassé toutes nos attentes.",
    image: media.testimonial(2),
    fallback: mediaFallback.testimonial,
  },
  {
    id: "3",
    name: "Élise Dubois",
    role: "Fondatrice",
    company: "Summit Pro",
    quote:
      "Professionnalisme, créativité et respect des délais. Nous recommandons sans hésitation pour tout événement d'envergure.",
    image: media.testimonial(3),
    fallback: mediaFallback.testimonial,
  },
] as const;

/** Contenu officiel gusEvent (présentation Instagram) */
export const agencySlides = [
  {
    id: "about",
    tab: "Qui sommes-nous",
    title: "Qui sommes-nous ?",
    type: "prose" as const,
    body: "gusEvent est une agence événementielle fondée le 28 décembre 2023. Spécialisée dans la création d'expériences uniques, notre équipe passionnée transforme chaque occasion en un moment inoubliable. Avec une approche alliant créativité, rigueur et service sur mesure, nous sommes le partenaire idéal pour des événements mémorables.",
  },
  {
    id: "mission",
    tab: "Notre mission",
    title: "Notre mission",
    type: "prose" as const,
    body: "Faire de chaque événement un souvenir impérissable en offrant des solutions personnalisées et innovantes qui répondent aux attentes les plus exigeantes. Notre objectif est de sublimer chaque moment et d'apporter une touche exceptionnelle à vos célébrations.",
  },
  {
    id: "values",
    tab: "Valeurs",
    title: "Nos objectifs et valeurs",
    type: "values" as const,
    items: [
      {
        label: "Excellence",
        text: "Garantir une qualité irréprochable dans chaque détail de l'organisation.",
      },
      {
        label: "Créativité",
        text: "Proposer des concepts novateurs et inspirants, adaptés aux besoins de nos clients.",
      },
      {
        label: "Écoute",
        text: "Comprendre et respecter les envies uniques de chaque client pour personnaliser chaque projet.",
      },
      {
        label: "Engagement",
        text: "Investir toute notre passion et expertise pour réaliser des événements à la hauteur de vos rêves.",
      },
    ],
  },
] as const;

export const footerLinks = {
  services: [
    { label: "Mariages", href: "/#services" },
    { label: "Corporate", href: "/#services" },
    { label: "Concerts", href: "/#services" },
    { label: "Conférences", href: "/#services" },
    { label: "Surprises", href: "/#services" },
  ],
  company: [
    { label: "Réalisations", href: "/#realisations" },
    { label: "À propos", href: "/#apropos" },
    { label: "Mission", href: "/#apropos" },
    { label: "Contact", href: "/#contact" },
    { label: "Demander un devis", href: "/devis" },
  ],
};

export const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/gus_event/" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Facebook", href: "https://facebook.com" },
];
