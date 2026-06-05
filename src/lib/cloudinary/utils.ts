/** Utilitaires sans dépendance Node — sûrs côté client. */

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_URL);
}

export function getCloudinaryFolder(): string {
  return process.env.CLOUDINARY_FOLDER ?? "gusevent/cms";
}

/** Miniature légère pour l'aperçu admin. */
export function cloudinaryPreviewUrl(url: string): string {
  if (!isCloudinaryUrl(url)) return url;
  if (url.includes("/upload/") && !url.includes("/upload/c_")) {
    return url.replace("/upload/", "/upload/c_limit,w_480,h_240,q_auto,f_auto/");
  }
  return url;
}

/** URL vidéo optimisée pour lecture web (hero, etc.). */
export function cloudinaryVideoUrl(url: string): string {
  if (!isCloudinaryUrl(url)) return url;
  const marker = "/video/upload/";
  if (
    url.includes(marker) &&
    !url.includes("/upload/q_") &&
    !url.includes("/upload/c_")
  ) {
    return url.replace(marker, "/video/upload/q_auto,f_auto/");
  }
  return url;
}
