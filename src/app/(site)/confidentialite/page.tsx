import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { getContactSettings } from "@/lib/settings/contact-settings";

export const metadata: Metadata = {
  title: `Politique de confidentialité — ${brand.name}`,
  description: `Comment ${brand.name} collecte et protège vos données personnelles.`,
  robots: { index: true, follow: true },
};

export default async function ConfidentialitePage() {
  const contact = await getContactSettings();
  const year = new Date().getFullYear();

  return (
    <div className="section-padding pt-28">
      <div className="container-narrow mx-auto max-w-3xl">
        <p className="label-upper text-gold">Protection des données</p>
        <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-4 text-sm text-muted">
          Dernière mise à jour : {year}
        </p>

        <div className="prose-site mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="font-display text-xl text-foreground">Responsable du traitement</h2>
            <p className="mt-3">
              {brand.legalName} — {contact.email}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Données collectées</h2>
            <p className="mt-3">Via le formulaire de devis et nos échanges, nous pouvons collecter :</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Identité : nom, prénom, société</li>
              <li>Coordonnées : email, téléphone</li>
              <li>Projet : type d&apos;événement, date, lieu, budget, message</li>
              <li>Données techniques : logs serveur, cookies essentiels au fonctionnement</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Finalités</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Répondre à votre demande de devis et vous recontacter</li>
              <li>Préparer et suivre votre événement</li>
              <li>Améliorer nos services et assurer la sécurité du site</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Base légale</h2>
            <p className="mt-3">
              Votre consentement lors de l&apos;envoi du formulaire, et l&apos;exécution de mesures
              précontractuelles liées à votre demande.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Durée de conservation</h2>
            <p className="mt-3">
              Les demandes de devis sont conservées le temps nécessaire au suivi commercial et
              contractuel, puis archivées ou supprimées selon nos obligations légales (généralement
              jusqu&apos;à 3 ans après le dernier contact pour les prospects).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Destinataires</h2>
            <p className="mt-3">
              Vos données sont accessibles à l&apos;équipe {brand.name} et à nos sous-traitants
              techniques (hébergement Vercel, base de données Neon, envoi d&apos;emails si configuré)
              dans le cadre strict de leurs missions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Vos droits</h2>
            <p className="mt-3">
              Vous pouvez demander l&apos;accès, la rectification, l&apos;effacement ou la limitation
              du traitement de vos données en écrivant à{" "}
              <a href={`mailto:${contact.email}`} className="text-gold hover:underline">
                {contact.email}
              </a>
              . Vous disposez également d&apos;un droit d&apos;opposition et de retrait de votre
              consentement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Cookies</h2>
            <p className="mt-3">
              Le site utilise des cookies strictement nécessaires à l&apos;authentification admin et
              au bon fonctionnement technique. Aucun cookie publicitaire tiers n&apos;est déposé par
              défaut.
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
