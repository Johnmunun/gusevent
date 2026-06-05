"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useDevisDrawer } from "@/components/devis/DevisDrawerProvider";
import { DevisSidebar } from "@/components/devis/DevisSidebar";
import { brand } from "@/config/brand";

export default function DevisPage() {
  const { open } = useDevisDrawer();

  return (
    <>
      <section className="bg-ink pt-28 pb-12 text-cream sm:pt-32 sm:pb-16">
        <div className="container-wide px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <p className="label-upper mt-8 text-gold">Devis gratuit</p>
          <div className="divider-gold mt-4 mb-6" />
          <h1 className="max-w-3xl font-display text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
            Demandez votre devis personnalisé
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-400 sm:text-lg">
            Remplissez le formulaire dans le panneau latéral. L&apos;équipe{" "}
            {brand.name} vous répond sous 24 heures.
          </p>
          <Link
            href="/devis/modifier"
            className="mt-4 inline-block text-sm text-stone-400 underline-offset-4 transition-colors hover:text-gold hover:underline"
          >
            Déjà une demande ? Modifier budget ou détails
          </Link>
          <button
            type="button"
            onClick={open}
            className="mt-8 inline-flex items-center gap-2 bg-gold px-8 py-3.5 text-sm font-medium text-ink transition-all hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-lg"
          >
            Ouvrir le formulaire
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="container-wide max-w-lg">
          <DevisSidebar />
        </div>
      </section>
    </>
  );
}
