import { copyFile, access, constants, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..", "public", "media");

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function copyIfExists(from, to) {
  const src = join(root, from);
  const dest = join(root, to);
  if (await exists(src)) {
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
    console.log(`✓ ${from} → ${to}`);
    return true;
  }
  return false;
}

/**
 * Vos .jpeg → hero + galerie (01 à 08)
 * Déposez : gallery/1.jpeg, 10.jpeg, 11.jpeg, 12.jpeg, 13.jpeg
 */
const mappings = [
  // Hero
  ["gallery/10.jpeg", "hero/hero.jpg"],
  ["gallery/11.jpeg", "hero/visual-1.jpg"],
  ["gallery/1.jpeg", "hero/visual-2.jpg"],
  // Réalisations — 8 photos (vos fichiers uniquement)
  ["gallery/1.jpeg", "gallery/01.jpg"],
  ["gallery/12.jpeg", "gallery/02.jpg"],
  ["gallery/13.jpeg", "gallery/03.jpg"],
  ["gallery/11.jpeg", "gallery/04.jpg"],
  ["gallery/10.jpeg", "gallery/05.jpg"],
  ["gallery/12.jpeg", "gallery/06.jpg"],
  ["gallery/13.jpeg", "gallery/07.jpg"],
  ["gallery/1.jpeg", "gallery/08.jpg"],
  // Témoignages
  ["testimonials/4.jpeg", "testimonials/01.jpg"],
  ["testimonials/5.jpeg", "testimonials/02.jpg"],
  ["testimonials/8.jpeg", "testimonials/03.jpg"],
];

console.log("Synchronisation de vos médias…\n");
for (const [from, to] of mappings) {
  await copyIfExists(from, to);
}
console.log("\nTerminé. Rafraîchissez la page (Ctrl+F5).");
