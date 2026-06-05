import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function saveLocalCmsImage(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "cms");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/cms/${name}`;
}
