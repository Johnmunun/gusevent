import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { uploadVideoBuffer } from "@/lib/cloudinary/upload";
import { isCloudinaryConfigured } from "@/lib/cloudinary/utils";

const MAX_SIZE = 25 * 1024 * 1024;
const MAX_DURATION_SECONDS = 10;
const ALLOWED = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.cmsEdit);
  if (guard.error) return guard.error;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary requis pour la vidéo hero (CLOUDINARY_URL manquant)" },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const durationRaw = formData.get("duration");
  const duration =
    typeof durationRaw === "string" ? Number.parseFloat(durationRaw) : NaN;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Format non autorisé (MP4, WebM ou MOV)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 25 Mo)" },
      { status: 400 }
    );
  }

  if (Number.isFinite(duration) && duration > MAX_DURATION_SECONDS) {
    return NextResponse.json(
      { error: `Vidéo trop longue (max ${MAX_DURATION_SECONDS} s)` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await uploadVideoBuffer(buffer);
    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      provider: "cloudinary",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Échec du téléversement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
