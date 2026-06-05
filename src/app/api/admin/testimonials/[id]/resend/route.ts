import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { sendTestimonialInviteEmail } from "@/lib/testimonials/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiPermission(PERMISSIONS.devis);
  if (guard.error) return guard.error;

  const { id } = await params;
  const result = await sendTestimonialInviteEmail(id);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Échec de l'envoi" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
