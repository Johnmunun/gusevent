import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { brand } from "@/config/brand";
import { sendMail } from "@/lib/email/mailer";
import { buildInvoiceDocument } from "@/lib/invoices/build-document";
import { generateInvoicePdf } from "@/lib/invoices/generate-pdf";
import { invoiceDocumentSchema } from "@/lib/invoices/validation";
import { prisma } from "@/lib/prisma";
import { getEmailSettings } from "@/lib/settings/email-settings";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiPermission(PERMISSIONS.devis);
  if (guard.error) return guard.error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = invoiceDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const quote = await prisma.quoteRequest.findUnique({ where: { id } });
  if (!quote) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  const document = buildInvoiceDocument(quote, parsed.data);
  const pdfBuffer = await generateInvoicePdf(document);
  const filename = `${document.documentNumber}.pdf`;

  if (parsed.data.send) {
    const settings = await getEmailSettings();
    const docLabel = document.documentType === "facture" ? "Facture" : "Devis";
    const emailText = [
      `Bonjour ${quote.fullName},`,
      "",
      parsed.data.customMessage ||
        `Veuillez trouver ci-joint votre ${docLabel.toLowerCase()} ${document.documentNumber} concernant votre projet (${quote.eventType}).`,
      "",
      `Montant total TTC : ${document.total.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${document.currencySymbol}`,
      "",
      "Pour toute question, répondez à cet email.",
      "",
      `Cordialement,`,
      `L'équipe ${brand.name}`,
    ].join("\n");

    const mailResult = await sendMail(settings, {
      to: quote.email,
      subject: `${docLabel} ${document.documentNumber} — ${brand.name}`,
      text: emailText,
      attachments: [{ filename, content: pdfBuffer }],
    });

    if (!mailResult.ok) {
      return NextResponse.json(
        { error: mailResult.error ?? "Envoi email impossible" },
        { status: 502 }
      );
    }

    if (quote.status === "NEW") {
      await prisma.quoteRequest.update({
        where: { id: quote.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json({
      ok: true,
      sent: true,
      documentNumber: document.documentNumber,
      messageId: mailResult.messageId,
    });
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
