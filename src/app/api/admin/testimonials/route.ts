import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAppUrl } from "@/lib/quotes/service";
import {
  buildTestimonialUrl,
  listTestimonialSubmissions,
} from "@/lib/testimonials/service";

export async function GET(request: Request) {
  const guardDevis = await requireApiPermission(PERMISSIONS.devis);
  const guardCms = await requireApiPermission(PERMISSIONS.cmsEdit);
  if (guardDevis.error && guardCms.error) {
    return guardDevis.error;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | null;

  const items = await listTestimonialSubmissions(status ?? undefined);
  const appUrl = getAppUrl();

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      token: item.token,
      status: item.status,
      link: buildTestimonialUrl(item.token, appUrl),
      quoteReference: item.quoteReference,
      clientEmail: item.clientEmail,
      prefillName: item.prefillName,
      submitterName: item.submitterName,
      submitterRole: item.submitterRole,
      submitterCompany: item.submitterCompany,
      text: item.text,
      image: item.image,
      submittedAt: item.submittedAt,
      inviteEmailSent: item.inviteEmailSent,
      createdAt: item.createdAt,
      quote: item.quote,
    })),
  });
}
