import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { brand } from "@/config/brand";
import { contact } from "@/config/contact";

export default function AdminSettingsPage() {
  return (
    <AdminShell
      title="Paramètres"
      description="Identité, coordonnées et préférences de l'agence."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Identité">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted">Nom</dt>
              <dd className="mt-1 font-medium text-foreground">{brand.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Fondée le</dt>
              <dd className="mt-1 text-foreground">{brand.founded}</dd>
            </div>
          </dl>
        </AdminCard>
        <AdminCard title="Contact public">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 text-foreground">{contact.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Téléphone</dt>
              <dd className="mt-1 text-foreground">{contact.phoneDisplay}</dd>
            </div>
          </dl>
        </AdminCard>
        <AdminCard title="Sécurité" className="lg:col-span-2">
          <p className="text-sm text-muted leading-relaxed">
            Authentification via <strong>Neon Auth</strong> (email / mot de passe).
            Les rôles panneau sont gérés dans la table Prisma{" "}
            <code className="text-xs">User</code>. Variables requises :{" "}
            <code className="text-xs">NEON_AUTH_BASE_URL</code>,{" "}
            <code className="text-xs">NEON_AUTH_COOKIE_SECRET</code>,{" "}
            <code className="text-xs">DATABASE_URL</code>.
          </p>
          <a
            href="/admin/utilisateurs"
            className="mt-4 inline-block bg-ink px-6 py-2.5 text-sm font-medium text-cream"
          >
            Gérer les utilisateurs
          </a>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
