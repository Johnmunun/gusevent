import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.cmsEdit);
  if (guard.error) return guard.error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Type non autorisé" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 });
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "cms");
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);

  const url = `/uploads/cms/${name}`;
  return NextResponse.json({ url });
}
