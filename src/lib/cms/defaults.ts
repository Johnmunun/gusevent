import { media, mediaFallback } from "@/config/media";
import type { CmsSlug, LandingCmsContent } from "@/lib/cms/types";

function galleryEntry(
  index: number,
  title: string,
  category: "mariages" | "corporate" | "concerts" | "conferences",
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

export const defaultLandingCms: LandingCmsContent = {
  hero: {
    eyebrow: "gusEvent",
    titleBefore: "Nous créons des ",
    titleHighlight: "événements",
    titleAfter: " inoubliables.",
    subtitle:
      "De la conception à la réalisation, nous transformons vos idées en expériences mémorables.",
    ctaSecondaryLabel: "Voir nos réalisations",
    ctaSecondaryHref: "/#realisations",
    backgroundImage: media.hero.image,
    backgroundImageFallbacks: [...media.hero.imageFallbacks],
  },
  stats: [
    { label: "Projets réalisés", value: 8, suffix: "", backdrop: "8" },
    { label: "Clients satisfaits", value: 620, suffix: "+" },
    { label: "Depuis", value: 2023, suffix: "" },
    { label: "Partenaires", value: 45, suffix: "+" },
  ],
  services: {
    heading: {
      eyebrow: "Nos services",
      title: "Chaque occasion mérite une signature unique",
      description:
        "Organisation complète, décoration sur mesure, surprises émotionnelles et coordination le jour J — un seul interlocuteur pour une exécution irréprochable.",
    },
    items: [
      {
        title: "Mariages",
        description:
          "Cérémonies élégantes et réceptions sur mesure, pensées dans les moindres détails pour un jour inoubliable.",
        iconKey: "Heart",
      },
      {
        title: "Conférences",
        description:
          "Scénographie, logistique et expérience participant pour des événements professionnels impeccables.",
        iconKey: "Mic2",
      },
      {
        title: "Événements d'entreprise",
        description:
          "Séminaires, lancements produits et team building avec une image de marque soignée et cohérente.",
        iconKey: "Building2",
      },
      {
        title: "Concerts",
        description:
          "Production technique, scène et ambiance pour des spectacles vivants mémorables.",
        iconKey: "Music",
      },
      {
        title: "Anniversaires",
        description:
          "Fêtes privées personnalisées, de l'intime au grandiose, avec une touche créative unique.",
        iconKey: "Cake",
      },
      {
        title: "Salons professionnels",
        description:
          "Stands, parcours visiteurs et coordination complète pour maximiser votre impact.",
        iconKey: "PartyPopper",
      },
      {
        title: "Surprises & moments magiques",
        description:
          "Toc à la porte, mots doux personnalisés selon votre histoire : nous orchestrons des apparitions discrètes, dans l'ombre, pour des surprises qui marquent les cœurs.",
        iconKey: "DoorOpen",
      },
    ],
  },
  gallery: {
    heading: {
      eyebrow: "Réalisations",
      title: "Des moments capturés, des émotions partagées",
      description:
        "Mariages, galas corporate, concerts et conventions — chaque projet reflète notre exigence créative.",
    },
    filters: [
      { id: "all", label: "Tous" },
      { id: "mariages", label: "Mariages" },
      { id: "corporate", label: "Corporate" },
      { id: "concerts", label: "Concerts" },
      { id: "conferences", label: "Conférences" },
    ],
    items: [
      galleryEntry(1, "Réception champêtre", "mariages", "tall"),
      galleryEntry(2, "Gala corporate", "corporate", "wide"),
      galleryEntry(3, "Scène live", "concerts", "normal"),
      galleryEntry(4, "Sommet leadership", "conferences", "normal"),
      galleryEntry(5, "Décoration florale", "mariages", "normal"),
      galleryEntry(6, "Networking lounge", "corporate", "tall"),
      galleryEntry(7, "Festival nocturne", "concerts", "wide"),
      galleryEntry(8, "Convention & gala", "conferences", "normal"),
    ],
  },
  testimonials: {
    heading: {
      eyebrow: "Témoignages",
      title: "Ils nous ont fait confiance",
      description:
        "La satisfaction de nos clients est notre plus belle récompense.",
    },
    items: [
      {
        id: "1",
        name: "Sophie Martin",
        role: "Directrice Marketing",
        company: "Lumière & Co",
        quote:
          "Une équipe exceptionnelle qui a su transformer notre vision en une expérience corporate fluide et mémorable.",
        image: media.testimonial(1),
        fallback: mediaFallback.testimonial,
      },
      {
        id: "2",
        name: "Karim Benali",
        role: "Marié",
        company: "Mariage — Marrakech",
        quote:
          "Notre mariage était un rêve éveillé. La décoration et l'ambiance ont dépassé toutes nos attentes.",
        image: media.testimonial(2),
        fallback: mediaFallback.testimonial,
      },
      {
        id: "3",
        name: "Élise Dubois",
        role: "Fondatrice",
        company: "Summit Pro",
        quote:
          "Professionnalisme, créativité et respect des délais. Nous recommandons sans hésitation.",
        image: media.testimonial(3),
        fallback: mediaFallback.testimonial,
      },
    ],
  },
  about: {
    heading: {
      eyebrow: "À propos",
      title: "L'agence derrière vos plus beaux moments",
      description:
        "Fondée le 28 décembre 2023, gusEvent allie créativité et rigueur.",
    },
    slides: [
      {
        id: "about",
        tab: "Qui sommes-nous",
        title: "Qui sommes-nous ?",
        type: "prose",
        body: "gusEvent est une agence événementielle fondée le 28 décembre 2023. Spécialisée dans la création d'expériences uniques, notre équipe passionnée transforme chaque occasion en un moment inoubliable.",
      },
      {
        id: "mission",
        tab: "Notre mission",
        title: "Notre mission",
        type: "prose",
        body: "Faire de chaque événement un souvenir impérissable en offrant des solutions personnalisées et innovantes qui répondent aux attentes les plus exigeantes.",
      },
      {
        id: "values",
        tab: "Valeurs",
        title: "Nos objectifs et valeurs",
        type: "values",
        items: [
          {
            label: "Excellence",
            text: "Garantir une qualité irréprochable dans chaque détail.",
          },
          {
            label: "Créativité",
            text: "Proposer des concepts novateurs adaptés à chaque client.",
          },
          {
            label: "Écoute",
            text: "Comprendre et respecter les envies uniques de chacun.",
          },
          {
            label: "Engagement",
            text: "Investir toute notre passion pour des événements à la hauteur de vos rêves.",
          },
        ],
      },
    ],
  },
  cta: {
    eyebrow: "Contact",
    title: "Prêt à organiser votre prochain événement ?",
    description:
      "L'équipe gusEvent vous répond sous 24 heures avec une proposition adaptée à votre vision et votre budget.",
    emailLabel: "Email",
    phoneLabel: "Téléphone",
  },
  footer: {
    tagline: "Créateurs d'expériences mémorables depuis 2023.",
    servicesLinks: [
      { label: "Mariages", href: "/#services" },
      { label: "Corporate", href: "/#services" },
      { label: "Concerts", href: "/#services" },
      { label: "Conférences", href: "/#services" },
      { label: "Surprises", href: "/#services" },
    ],
    companyLinks: [
      { label: "Réalisations", href: "/#realisations" },
      { label: "À propos", href: "/#apropos" },
      { label: "Mission", href: "/#apropos" },
      { label: "Contact", href: "/#contact" },
      { label: "Demander un devis", href: "/devis" },
    ],
    socialLinks: [
      { label: "Instagram", href: "https://www.instagram.com/gus_event/" },
      { label: "LinkedIn", href: "https://linkedin.com" },
      { label: "Facebook", href: "https://facebook.com" },
    ],
  },
};

export const CMS_SECTION_LABELS: Record<CmsSlug, string> = {
  hero: "Bannière d'accueil",
  stats: "Chiffres clés",
  services: "Services",
  gallery: "Galerie / réalisations",
  testimonials: "Témoignages",
  about: "À propos & mission",
  cta: "Bloc contact",
  footer: "Pied de page",
};

export function getDefaultSection<K extends CmsSlug>(
  slug: K
): LandingCmsContent[K] {
  return defaultLandingCms[slug];
}
