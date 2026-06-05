import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import type { TestimonialSubmission, TestimonialSubmissionStatus } from "@prisma/client";
import { brand } from "@/config/brand";
import { mediaFallback } from "@/config/media";
import { getCmsSection, saveCmsSection } from "@/lib/cms/get-content";
import type { CmsTestimonialItem } from "@/lib/cms/types";
import { sendMail } from "@/lib/email/mailer";
import { getAppUrl } from "@/lib/quotes/service";
import { getEmailSettings } from "@/lib/settings/email-settings";
import { prisma } from "@/lib/prisma";
import type { TestimonialSubmitInput } from "@/lib/testimonials/validation";

function generateToken() {
  return randomBytes(24).toString("base64url");
}

export function buildTestimonialUrl(token: string, appUrl?: string) {
  const base = (appUrl ?? getAppUrl()).replace(/\/$/, "");
  return `${base}/temoignage/${token}`;
}

export async function getTestimonialInviteByToken(token: string) {
  return prisma.testimonialSubmission.findUnique({
    where: { token },
    include: {
      quote: {
        select: {
          eventType: true,
          eventDate: true,
          fullName: true,
          company: true,
        },
      },
    },
  });
}

export async function getOrCreateTestimonialInvite(
  quoteId: string,
  options?: { sendEmail?: boolean }
) {
  const quote = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  if (!quote) {
    throw new Error("Demande introuvable");
  }

  const existing = await prisma.testimonialSubmission.findFirst({
    where: {
      quoteId,
      status: "PENDING",
      submittedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    if (options?.sendEmail) {
      await sendTestimonialInviteEmail(existing.id);
    }
    return existing;
  }

  const submission = await prisma.testimonialSubmission.create({
    data: {
      token: generateToken(),
      quoteId: quote.id,
      quoteReference: quote.reference,
      clientEmail: quote.email,
      prefillName: quote.fullName,
      prefillCompany: quote.company,
    },
  });

  if (options?.sendEmail) {
    await sendTestimonialInviteEmail(submission.id);
  }

  return submission;
}

export async function sendTestimonialInviteEmail(submissionId: string) {
  const submission = await prisma.testimonialSubmission.findUnique({
    where: { id: submissionId },
    include: {
      quote: true,
    },
  });

  if (!submission) return { ok: false, error: "Invitation introuvable" };

  const quote = submission.quote;
  const email = submission.clientEmail ?? quote?.email;
  if (!email) {
    return { ok: false, error: "Email client manquant" };
  }

  const settings = await getEmailSettings();
  const appUrl = getAppUrl();
  const link = buildTestimonialUrl(submission.token, appUrl);
  const eventType = quote?.eventType ?? "événement";
  const fullName = submission.prefillName ?? quote?.fullName ?? "Bonjour";

  const result = await sendMail(settings, {
    to: email,
    subject: `Votre avis compte pour nous — ${brand.name}`,
    text: `Bonjour ${fullName},

Merci d'avoir fait confiance à ${brand.name} pour votre ${eventType}.

Nous serions ravis de recueillir votre témoignage en quelques minutes :
${link}

Votre retour nous aide à améliorer nos prestations et à inspirer de futurs clients.

Cordialement,
L'équipe ${brand.name}`,
  });

  await prisma.testimonialSubmission.update({
    where: { id: submissionId },
    data: {
      inviteEmailSent: result.ok,
      inviteEmailError: result.ok ? null : result.error,
    },
  });

  return result;
}

export async function submitTestimonial(
  token: string,
  input: TestimonialSubmitInput
) {
  const submission = await prisma.testimonialSubmission.findUnique({
    where: { token },
  });

  if (!submission) {
    throw new Error("Lien invalide ou expiré");
  }

  if (submission.status === "REJECTED") {
    throw new Error("Cette invitation n'est plus disponible");
  }

  if (submission.submittedAt) {
    throw new Error("Témoignage déjà envoyé");
  }

  const updated = await prisma.testimonialSubmission.update({
    where: { id: submission.id },
    data: {
      submitterName: input.name,
      submitterRole: input.role || "Client",
      submitterCompany: input.company || submission.prefillCompany || null,
      text: input.text,
      image: input.image || null,
      submittedAt: new Date(),
    },
  });

  await prisma.adminNotification.create({
    data: {
      type: "testimonial_submission",
      title: "Nouveau témoignage client",
      message: `${input.name} — en attente de validation`,
      link: "/admin/temoignages",
      meta: {
        submissionId: updated.id,
        quoteReference: updated.quoteReference,
      },
    },
  });

  return updated;
}

export async function listTestimonialSubmissions(status?: TestimonialSubmissionStatus) {
  return prisma.testimonialSubmission.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
    include: {
      quote: {
        select: {
          id: true,
          reference: true,
          eventType: true,
          fullName: true,
        },
      },
    },
  });
}

export async function approveTestimonialSubmission(id: string, updatedBy?: string) {
  const submission = await prisma.testimonialSubmission.findUnique({
    where: { id },
  });

  if (!submission) {
    throw new Error("Témoignage introuvable");
  }

  if (!submission.submittedAt || !submission.text || !submission.submitterName) {
    throw new Error("Le client n'a pas encore soumis son témoignage");
  }

  if (submission.status === "APPROVED") {
    return submission;
  }

  const cms = await getCmsSection("testimonials");
  const newItem: CmsTestimonialItem = {
    id: `client-${submission.id}`,
    name: submission.submitterName,
    role: submission.submitterRole || "Client",
    company: submission.submitterCompany || "",
    quote: submission.text,
    image: submission.image || mediaFallback.testimonial,
    fallback: mediaFallback.testimonial,
  };

  await saveCmsSection(
    "testimonials",
    {
      ...cms,
      items: [newItem, ...cms.items.filter((i) => i.id !== newItem.id)],
    },
    updatedBy
  );

  const updated = await prisma.testimonialSubmission.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  revalidatePath("/", "layout");
  revalidatePath("/");

  return updated;
}

export async function rejectTestimonialSubmission(id: string) {
  const submission = await prisma.testimonialSubmission.findUnique({
    where: { id },
  });

  if (!submission) {
    throw new Error("Témoignage introuvable");
  }

  return prisma.testimonialSubmission.update({
    where: { id },
    data: { status: "REJECTED" },
  });
}

export function serializePublicInvite(submission: TestimonialSubmission & {
  quote?: {
    eventType: string;
    eventDate: string | null;
    fullName: string;
    company: string | null;
  } | null;
}) {
  const alreadySubmitted = Boolean(submission.submittedAt);
  const canSubmit =
    submission.status === "PENDING" && !alreadySubmitted;

  return {
    token: submission.token,
    status: submission.status,
    canSubmit,
    alreadySubmitted,
    prefill: {
      name: submission.prefillName ?? submission.quote?.fullName ?? "",
      company:
        submission.prefillCompany ?? submission.quote?.company ?? "",
      role: "Client",
    },
    event: submission.quote
      ? {
          type: submission.quote.eventType,
          date: submission.quote.eventDate,
        }
      : null,
  };
}
