"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { QuoteModifyFlow } from "@/components/devis/QuoteModifyFlow";

function DevisModifierContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") ?? "";

  return <QuoteModifyFlow initialReference={initialRef} />;
}

export default function DevisModifierPage() {
  return (
    <>
      <section className="bg-ink pt-28 pb-12 text-cream sm:pt-32 sm:pb-16">
        <div className="container-wide px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au devis
          </Link>
          <p className="label-upper mt-8 text-gold">Modification</p>
          <div className="divider-gold mt-4 mb-6" />
          <h1 className="max-w-3xl font-display text-3xl font-medium leading-tight sm:text-4xl">
            Modifier votre demande de devis
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-400">
            Budget, date, lieu ou détails : mettez à jour votre brief sans
            refaire une nouvelle demande.
          </p>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="container-wide max-w-3xl">
          <Suspense
            fallback={
              <p className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement…
              </p>
            }
          >
            <DevisModifierContent />
          </Suspense>
        </div>
      </section>
    </>
  );
}
