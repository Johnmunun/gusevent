import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAppUrl } from "@/lib/quotes/service";
import {
  buildTestimonialUrl,
  getOrCreateTestimonialInvite,
} from "@/lib/testimonials/service";
import { testimonialInviteSchema } from "@/lib/testimonials/validation";

export async function POST(request: Request) {
  const guard = await requireApiPermission(PERMISSIONS.devis);
  if (guard.error) return guard.error;

  const body = await request.json();
  const parsed = testimonialInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const submission = await getOrCreateTestimonialInvite(parsed.data.quoteId, {
      sendEmail: parsed.data.sendEmail ?? false,
    });
    const appUrl = getAppUrl();

    return NextResponse.json({
      id: submission.id,
      token: submission.token,
      link: buildTestimonialUrl(submission.token, appUrl),
      inviteEmailSent: submission.inviteEmailSent,
      inviteEmailError: submission.inviteEmailError,
    });
  } catch (err) {
    console.error("[testimonials/invite]", err);
    const raw = err instanceof Error ? err.message : "Erreur serveur";
    const message = raw.includes("findFirst")
      ? "Client Prisma obsolète — redémarrez le serveur (Ctrl+C puis npm run dev)."
      : raw;
    const status = message.includes("introuvable") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
