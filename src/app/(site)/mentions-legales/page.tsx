import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { getContactSettings } from "@/lib/settings/contact-settings";
import { getSiteUrl } from "@/lib/site/metadata";

export const metadata: Metadata = {
  title: `Mentions légales — ${brand.name}`,
  description: `Mentions légales du site ${brand.name}.`,
  robots: { index: true, follow: true },
};

export default async function MentionsLegalesPage() {
  const contact = await getContactSettings();
  const siteUrl = getSiteUrl();
  const year = new Date().getFullYear();

  return (
    <div className="section-padding pt-28">
      <div className="container-narrow mx-auto max-w-3xl">
        <p className="label-upper text-gold">Informations légales</p>
        <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
          Mentions légales
        </h1>
        <p className="mt-4 text-sm text-muted">
          Dernière mise à jour : {year}
        </p>

        <div className="prose-site mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="font-display text-xl text-foreground">Éditeur du site</h2>
            <p className="mt-3">
              <strong className="text-foreground">{brand.legalName}</strong>
              <br />
              {contact.addressLine1}
              <br />
              {contact.addressLine2}
              <br />
              Email :{" "}
              <a href={`mailto:${contact.email}`} className="text-gold hover:underline">
                {contact.email}
              </a>
              <br />
              Téléphone : {contact.phoneDisplay}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Directeur de publication</h2>
            <p className="mt-3">Le responsable de {brand.name}.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Hébergement</h2>
            <p className="mt-3">
              Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
              États-Unis —{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                vercel.com
              </a>
              .
              <br />
              Base de données : Neon Tech (PostgreSQL serverless).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Propriété intellectuelle</h2>
            <p className="mt-3">
              L&apos;ensemble des éléments du site {siteUrl} (textes, images, graphismes, logo,
              structure) est protégé par le droit de la propriété intellectuelle. Toute
              reproduction non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Responsabilité</h2>
            <p className="mt-3">
              {brand.name} s&apos;efforce d&apos;assurer l&apos;exactitude des informations
              publiées. Toutefois, des erreurs ou omissions peuvent subsister. L&apos;utilisation
              du site se fait sous la responsabilité de l&apos;utilisateur.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Données personnelles</h2>
            <p className="mt-3">
              Pour le traitement de vos données, consultez notre{" "}
              <Link href="/confidentialite" className="text-gold hover:underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </section>
        </div>

        <p className="mt-12 text-sm">
          <Link href="/" className="text-gold hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
