/**
 * Médias locaux — public/media/
 * Après dépôt des fichiers : npm run media:sync
 */

const base = "/media";

/** Fichiers .jpeg que vous déposez dans gallery/ */
const galleryJpegBySlot: Record<number, string> = {
  1: "1",
  2: "12",
  3: "13",
  4: "11",
  5: "10",
  6: "12",
  7: "13",
  8: "1",
};

export const media = {
  logo: {
    svg: `${base}/logo.svg`,
    png: `${base}/logo.png`,
    jpg: `${base}/logo.jpg`,
  },
  hero: {
    image: `${base}/hero/hero.jpg`,
    visualMain: `${base}/hero/visual-1.jpg`,
    visualSmall: `${base}/hero/visual-2.jpg`,
    video: `${base}/hero/hero-video.mp4`,
    imageFallbacks: [
      `${base}/gallery/10.jpeg`,
      `${base}/gallery/11.jpeg`,
      `${base}/gallery/1.jpeg`,
    ],
  },
  gallery: (index: number) =>
    `${base}/gallery/${String(index).padStart(2, "0")}.jpg`,
  /** Chemins alternatifs (.jpeg) pour la section Réalisations */
  gallerySources: (index: number) => {
    const pad = String(index).padStart(2, "0");
    const sources = [`${base}/gallery/${pad}.jpg`];
    const jpegNum = galleryJpegBySlot[index];
    if (jpegNum) {
      sources.push(`${base}/gallery/${jpegNum}.jpeg`);
    }
    return sources;
  },
  testimonial: (index: number) =>
    `${base}/testimonials/${String(index).padStart(2, "0")}.jpg`,
} as const;

/** Uniquement pour témoignages si besoin */
export const mediaFallback = {
  testimonial:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
} as const;
