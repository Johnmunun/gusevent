import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "media");

const files = [
  ["hero/hero.jpg", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&q=85"],
  ["gallery/01.jpg", "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80"],
  ["gallery/02.jpg", "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80"],
  ["gallery/03.jpg", "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80"],
  ["gallery/04.jpg", "https://images.unsplash.com/photo-1523580494863-6f3031224c87?w=900&q=80"],
  ["gallery/05.jpg", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80"],
  ["gallery/06.jpg", "https://images.unsplash.com/photo-1560439514-4e9645039924?w=900&q=80"],
  ["gallery/07.jpg", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&q=80"],
  ["gallery/08.jpg", "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=900&q=80"],
  ["gallery/09.jpg", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=85"],
  ["gallery/10.jpg", "https://images.unsplash.com/photo-1459749411175-04bf5294c0a0?w=900&q=80"],
  ["gallery/11.jpg", "https://images.unsplash.com/photo-1475721027785-f74eccf83e40?w=900&q=80"],
  ["testimonials/01.jpg", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"],
  ["testimonials/02.jpg", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"],
  ["testimonials/03.jpg", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"],
];

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="28" fill="#1c1917"/>
  <path d="M38 78V42h12c14 0 22 7 22 18s-8 18-22 18H38zm12-10h8c6 0 10-3 10-8s-4-8-10-8h-8v16z" fill="#fafaf9"/>
  <circle cx="88" cy="38" r="6" fill="#d97706"/>
</svg>`;

async function download(path, url) {
  const dest = join(root, path);
  await mkdir(dirname(dest), { recursive: true });
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("✗", path, res.status);
      return false;
    }
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log("✓", path);
    return true;
  } catch (e) {
    console.warn("✗", path, e.message);
    return false;
  }
}

console.log("Téléchargement des médias…\n");
await mkdir(join(root, "hero"), { recursive: true });
await mkdir(join(root, "gallery"), { recursive: true });
await mkdir(join(root, "testimonials"), { recursive: true });
await writeFile(join(root, "logo.svg"), logoSvg);
console.log("✓ logo.svg");

for (const [path, url] of files) {
  await download(path, url);
}
console.log("\nTerminé.");
