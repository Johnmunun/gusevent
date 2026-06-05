export const CMS_SLUGS = [
  "hero",
  "stats",
  "services",
  "gallery",
  "testimonials",
  "about",
  "cta",
  "footer",
] as const;

export type CmsSlug = (typeof CMS_SLUGS)[number];

export type CmsStatItem = {
  label: string;
  value: number;
  suffix: string;
  backdrop?: string;
};

export type CmsHeroContent = {
  eyebrow: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  subtitle: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  backgroundImage: string;
  backgroundImageFallbacks: string[];
  /** Vidéo courte (≤ 10 s recommandé), muette en boucle */
  backgroundVideo?: string;
};

export type CmsSectionHeading = {
  eyebrow: string;
  title: string;
  description: string;
};

export type CmsServiceItem = {
  title: string;
  description: string;
  iconKey: string;
};

export type CmsServicesContent = {
  heading: CmsSectionHeading;
  items: CmsServiceItem[];
};

export type GalleryCategory =
  | "all"
  | "mariages"
  | "corporate"
  | "concerts"
  | "conferences";

export type CmsGalleryItem = {
  id: string;
  title: string;
  category: Exclude<GalleryCategory, "all">;
  image: string;
  sources: string[];
  span: "tall" | "wide" | "normal";
};

export type CmsGalleryContent = {
  heading: CmsSectionHeading;
  filters: { id: GalleryCategory; label: string }[];
  items: CmsGalleryItem[];
};

export type CmsTestimonialItem = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
  fallback: string;
};

export type CmsTestimonialsContent = {
  heading: CmsSectionHeading;
  items: CmsTestimonialItem[];
};

export type CmsAgencySlideProse = {
  id: string;
  tab: string;
  title: string;
  type: "prose";
  body: string;
};

export type CmsAgencySlideValues = {
  id: string;
  tab: string;
  title: string;
  type: "values";
  items: { label: string; text: string }[];
};

export type CmsAgencySlide = CmsAgencySlideProse | CmsAgencySlideValues;

export type CmsAboutContent = {
  heading: CmsSectionHeading;
  slides: CmsAgencySlide[];
};

export type CmsCtaContent = {
  eyebrow: string;
  title: string;
  description: string;
  emailLabel: string;
  phoneLabel: string;
};

export type CmsFooterContent = {
  tagline: string;
  servicesLinks: { label: string; href: string }[];
  companyLinks: { label: string; href: string }[];
  socialLinks: { label: string; href: string }[];
};

export type LandingCmsContent = {
  hero: CmsHeroContent;
  stats: CmsStatItem[];
  services: CmsServicesContent;
  gallery: CmsGalleryContent;
  testimonials: CmsTestimonialsContent;
  about: CmsAboutContent;
  cta: CmsCtaContent;
  footer: CmsFooterContent;
};

export type CmsSectionMap = {
  hero: CmsHeroContent;
  stats: CmsStatItem[];
  services: CmsServicesContent;
  gallery: CmsGalleryContent;
  testimonials: CmsTestimonialsContent;
  about: CmsAboutContent;
  cta: CmsCtaContent;
  footer: CmsFooterContent;
};
