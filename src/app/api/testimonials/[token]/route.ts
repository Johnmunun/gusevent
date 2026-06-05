import { NextResponse } from "next/server";
import {
  getTestimonialInviteByToken,
  serializePublicInvite,
  submitTestimonial,
} from "@/lib/testimonials/service";
import { testimonialSubmitSchema } from "@/lib/testimonials/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const submission = await getTestimonialInviteByToken(token);

  if (!submission) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
  }

  return NextResponse.json(serializePublicInvite(submission));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const parsed = testimonialSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const submission = await submitTestimonial(token, parsed.data);
    return NextResponse.json({
      ok: true,
      status: submission.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message.includes("invalide") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
