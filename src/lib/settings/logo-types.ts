import { media } from "@/config/media";

export type LogoSettings = {
  /** URL Cloudinary, /uploads/… ou /media/… — vide = fichiers par défaut */
  url: string;
  /** Afficher le nom de marque à côté du pictogramme */
  showText: boolean;
};

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  url: "",
  showText: true,
};

export const DEFAULT_LOGO_CHAIN = [
  media.logo.svg,
  media.logo.png,
  media.logo.jpg,
] as const;

export function mergeLogoSettings(
  stored: Partial<LogoSettings> | null | undefined
): LogoSettings {
  return { ...DEFAULT_LOGO_SETTINGS, ...stored };
}
