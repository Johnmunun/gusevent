import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { uploadImageBuffer } from "@/lib/cloudinary/upload";
import { isCloudinaryConfigured } from "@/lib/cloudinary/utils";
import { saveLocalCmsImage } from "@/lib/cloudinary/local-upload";

const MAX_SIZE = 10 * 1024 * 1024;
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
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 10 Mo)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (isCloudinaryConfigured()) {
      const result = await uploadImageBuffer(buffer);
      return NextResponse.json({
        url: result.url,
        publicId: result.publicId,
        provider: "cloudinary",
      });
    }

    const url = await saveLocalCmsImage(buffer, file.type);
    return NextResponse.json({ url, provider: "local" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Échec du téléversement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
