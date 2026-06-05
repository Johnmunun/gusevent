import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { approveTestimonialSubmission } from "@/lib/testimonials/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiPermission(PERMISSIONS.cmsEdit);
  if (guard.error) return guard.error;

  const { id } = await params;

  try {
    const submission = await approveTestimonialSubmission(id);
    return NextResponse.json({ ok: true, status: submission.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
