import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { buildPublicEventShare } from "@/lib/share/event-share";
import { getAppUrl } from "@/lib/quotes/service";
import {
  buildTestimonialUrl,
} from "@/lib/testimonials/service";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiPermission(PERMISSIONS.devis);
  if (guard.error) return guard.error;

  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({ where: { id } });

  if (!quote) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  const share = buildPublicEventShare(quote);
  const appUrl = getAppUrl();

  let testimonialLink: string | null = null;
  try {
    const pendingInvite = await prisma.testimonialSubmission.findFirst({
      where: {
        quoteId: id,
        status: "PENDING",
        submittedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
    if (pendingInvite) {
      testimonialLink = buildTestimonialUrl(pendingInvite.token, appUrl);
    }
  } catch (err) {
    console.error("[share] testimonial lookup failed:", err);
  }

  return NextResponse.json({
    shareEnabled: quote.shareEnabled,
    canShare: ["REPLIED", "CLOSED"].includes(quote.status),
    share,
    testimonialLink,
  });
}
