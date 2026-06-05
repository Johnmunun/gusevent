import { NextResponse } from "next/server";
import { quoteLookupSchema } from "@/lib/quotes/validation";
import {
  CLIENT_EDITABLE_STATUSES,
  findQuoteByReferenceAndEmail,
  quoteToFormData,
} from "@/lib/quotes/service";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = quoteLookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const quote = await findQuoteByReferenceAndEmail(
    parsed.data.reference,
    parsed.data.email
  );

  if (!quote) {
    return NextResponse.json(
      { error: "Référence ou email incorrect." },
      { status: 404 }
    );
  }

  if (!CLIENT_EDITABLE_STATUSES.includes(quote.status)) {
    return NextResponse.json(
      {
        error:
          "Cette demande est clôturée et ne peut plus être modifiée en ligne. Contactez-nous par téléphone ou email.",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    ok: true,
    reference: quote.reference,
    status: quote.status,
    form: quoteToFormData(quote),
  });
}
