import Link from "next/link";
import { notFound } from "next/navigation";
import { TestimonialSubmitForm } from "@/components/testimonials/TestimonialSubmitForm";
import { brand } from "@/config/brand";
import {
  getTestimonialInviteByToken,
  serializePublicInvite,
} from "@/lib/testimonials/service";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function TestimonialPage({ params }: PageProps) {
  const { token } = await params;
  const submission = await getTestimonialInviteByToken(token);

  if (!submission) notFound();

  const data = serializePublicInvite(submission);

  return (
    <div className="section-padding pt-28">
      <div className="container-narrow mx-auto max-w-2xl">
        <p className="label-upper text-gold">Témoignage</p>
        <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
          Partagez votre expérience
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Votre retour aide {brand.name} à s&apos;améliorer et inspire de futurs
          clients. Merci de prendre quelques minutes pour nous écrire.
        </p>

        {data.event ? (
          <p className="mt-4 border border-border bg-surface px-4 py-3 text-sm text-muted">
            Événement :{" "}
            <span className="text-foreground">{data.event.type}</span>
            {data.event.date ? ` · ${data.event.date}` : ""}
          </p>
        ) : null}

        <div className="mt-8">
          {data.status === "REJECTED" ? (
            <p className="border border-border px-5 py-8 text-sm text-muted">
              Ce lien n&apos;est plus actif.
            </p>
          ) : data.alreadySubmitted || data.status === "APPROVED" ? (
            <div className="border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
              <p className="font-display text-2xl text-foreground">
                Merci, votre témoignage a déjà été envoyé.
              </p>
              <p className="mt-3 text-sm text-muted">
                L&apos;équipe {brand.name} le relira avant publication.
              </p>
              <Link
                href="/#temoignages"
                className="mt-6 inline-block text-sm text-gold hover:underline"
              >
                Voir les témoignages sur le site
              </Link>
            </div>
          ) : data.canSubmit ? (
            <TestimonialSubmitForm token={token} prefill={data.prefill} />
          ) : (
            <p className="text-sm text-muted">Lien non disponible.</p>
          )}
        </div>
      </div>
    </div>
  );
}
