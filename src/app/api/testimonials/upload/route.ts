import { NextResponse } from "next/server";
import { uploadImageBuffer } from "@/lib/cloudinary/upload";
import { saveLocalCmsImage } from "@/lib/cloudinary/local-upload";
import { isCloudinaryConfigured } from "@/lib/cloudinary/utils";
import { getTestimonialInviteByToken } from "@/lib/testimonials/service";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const token = String(formData.get("token") ?? "");

  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400 });
  }

  const submission = await getTestimonialInviteByToken(token);
  if (
    !submission ||
    submission.status !== "PENDING" ||
    submission.submittedAt
  ) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 403 });
  }

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Type non autorisé" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 5 Mo)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (isCloudinaryConfigured()) {
      const result = await uploadImageBuffer(buffer, {
        folder: "gusevent/testimonials",
      });
      return NextResponse.json({ url: result.url });
    }

    const url = await saveLocalCmsImage(buffer, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Échec du téléversement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
