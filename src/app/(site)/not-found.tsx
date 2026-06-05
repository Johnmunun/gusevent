import Link from "next/link";
import { brand } from "@/config/brand";

export default function SiteNotFound() {
  return (
    <div className="section-padding flex min-h-[60vh] flex-col items-center justify-center pt-28 text-center">
      <p className="label-upper text-gold">404</p>
      <h1 className="mt-4 font-display text-3xl text-foreground sm:text-4xl">
        Page introuvable
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-stone-800"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/devis"
          className="border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground hover:border-gold/50"
        >
          Demander un devis
        </Link>
      </div>
      <p className="mt-10 text-xs text-muted">
        {brand.name} — Agence événementielle
      </p>
    </div>
  );
}
