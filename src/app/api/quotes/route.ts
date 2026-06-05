import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/quotes/validation";
import {
  createQuoteRequest,
  dispatchQuoteEmails,
} from "@/lib/quotes/service";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const quote = await createQuoteRequest(parsed.data);

    void dispatchQuoteEmails(quote.id).catch((err) => {
      console.error("[quotes] email dispatch failed:", err);
    });

    return NextResponse.json({
      ok: true,
      reference: quote.reference,
      message:
        "Votre demande a été enregistrée. Vous recevrez une confirmation par email si l'envoi est configuré.",
    });
  } catch (err) {
    console.error("[quotes] create failed:", err);
    return NextResponse.json(
      { error: "Impossible d'enregistrer la demande. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
