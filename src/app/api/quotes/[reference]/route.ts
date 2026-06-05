import { NextResponse } from "next/server";
import { quoteClientUpdateSchema } from "@/lib/quotes/validation";
import {
  CLIENT_EDITABLE_STATUSES,
  findQuoteByReferenceAndEmail,
  notifyQuoteUpdated,
  quoteToFormData,
  updateQuoteRequest,
} from "@/lib/quotes/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = quoteClientUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const quote = await findQuoteByReferenceAndEmail(
    reference,
    parsed.data.verifyEmail
  );

  if (!quote) {
    return NextResponse.json(
      { error: "Référence ou email de vérification incorrect." },
      { status: 404 }
    );
  }

  if (!CLIENT_EDITABLE_STATUSES.includes(quote.status)) {
    return NextResponse.json(
      { error: "Cette demande ne peut plus être modifiée en ligne." },
      { status: 403 }
    );
  }

  const { verifyEmail: _verify, ...fields } = parsed.data;

  try {
    const updated = await updateQuoteRequest(quote, fields);
    await notifyQuoteUpdated(updated);

    return NextResponse.json({
      ok: true,
      reference: updated.reference,
      form: quoteToFormData(updated),
      message: "Votre demande a été mise à jour.",
    });
  } catch (err) {
    console.error("[quotes] client update failed:", err);
    return NextResponse.json(
      { error: "Impossible de mettre à jour la demande." },
      { status: 500 }
    );
  }
}
