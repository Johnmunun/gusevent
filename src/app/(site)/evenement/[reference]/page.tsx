import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventShareButtons } from "@/components/share/EventShareButtons";
import { brand } from "@/config/brand";
import {
  buildPublicEventShare,
  formatEventDate,
  isPublicEventVisible,
} from "@/lib/share/event-share";
import { getAppUrl } from "@/lib/quotes/service";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ reference: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { reference } = await params;
  const quote = await prisma.quoteRequest.findFirst({
    where: { reference: { equals: reference, mode: "insensitive" } },
  });

  if (!quote || !isPublicEventVisible(quote)) {
    return { title: "Événement" };
  }

  const share = buildPublicEventShare(quote);
  const appUrl = getAppUrl();

  return {
    title: `${quote.eventType} — ${brand.name}`,
    description: share?.shareText,
    openGraph: {
      title: `${quote.eventType} — ${brand.name}`,
      description: share?.shareText,
      url: `${appUrl}/evenement/${quote.reference}`,
      type: "website",
    },
  };
}

export default async function PublicEventPage({ params }: PageProps) {
  const { reference } = await params;
  const quote = await prisma.quoteRequest.findFirst({
    where: { reference: { equals: reference, mode: "insensitive" } },
  });

  if (!quote || !isPublicEventVisible(quote)) notFound();

  const share = buildPublicEventShare(quote);
  if (!share) notFound();

  return (
    <div className="section-padding pt-28">
      <div className="container-narrow mx-auto max-w-2xl">
        <p className="label-upper text-gold">Réalisation</p>
        <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
          {quote.eventType}
        </h1>
        <p className="mt-4 text-sm text-muted">
          Un événement réalisé par {brand.name}
        </p>

        <dl className="mt-8 space-y-4 border border-border bg-surface p-6">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Date
            </dt>
            <dd className="mt-1 text-foreground">
              {formatEventDate(quote.eventDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Lieu
            </dt>
            <dd className="mt-1 text-foreground">
              {quote.location?.trim() || "Non communiqué"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Référence
            </dt>
            <dd className="mt-1 font-mono text-sm text-muted">
              {quote.reference}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Partager cet événement
          </p>
          <EventShareButtons
            url={share.url}
            shareText={share.shareText}
            links={share.links}
          />
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/#realisations" className="text-gold hover:underline">
            Voir nos réalisations
          </Link>
          <Link href="/devis" className="text-muted hover:text-foreground">
            Demander un devis
          </Link>
        </div>
      </div>
    </div>
  );
}
