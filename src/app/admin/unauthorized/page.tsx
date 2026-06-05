import Link from "next/link";
import { brand } from "@/config/brand";

export default function AdminUnauthorizedPage() {
  return (
    <div className="admin-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg border border-border bg-surface p-8 shadow-lg sm:p-10">
        <p className="font-display text-2xl text-foreground">{brand.name}</p>
        <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-gold uppercase">
          Accès panneau refusé
        </p>
        <p className="mt-6 text-sm text-muted leading-relaxed">
          Votre compte Neon Auth est connecté, mais aucun profil actif avec les
          droits nécessaires n&apos;existe pour cet email. Un super administrateur
          doit vous ajouter dans <strong>Utilisateurs</strong> (même adresse email).
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/login"
            className="bg-ink px-4 py-2.5 text-sm font-medium text-cream"
          >
            Changer de compte
          </Link>
          <Link href="/" className="border border-border px-4 py-2.5 text-sm">
            Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
