"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { ADMIN_CARD_ICONS } from "@/lib/admin/card-icons";
import { EmailSettingsForm } from "@/components/admin/settings/EmailSettingsForm";
import { ContactSettingsForm } from "@/components/admin/settings/ContactSettingsForm";
import { HrPayrollSettingsForm } from "@/components/admin/settings/HrPayrollSettingsForm";
import { LogoSettingsForm } from "@/components/admin/settings/LogoSettingsForm";
import type { SystemSettingsData } from "@/lib/system/service";

function StatusRow({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail: string;
}) {
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <li className="flex items-start gap-3 text-sm">
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${ok ? "text-emerald-600" : "text-stone-400"}`}
      />
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted">{detail}</p>
      </div>
    </li>
  );
}

export function SettingsPageView() {
  const [data, setData] = useState<SystemSettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/system/settings", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then((json: SystemSettingsData) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-12 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des paramètres…
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted">
        Impossible de charger les paramètres système.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard
        title="Logo du site"
        icon={ADMIN_CARD_ICONS.logo}
        className="lg:col-span-2"
      >
        <LogoSettingsForm />
      </AdminCard>

      <AdminCard title="Contact & réseaux" icon={ADMIN_CARD_ICONS.contact} className="lg:col-span-2">
        <ContactSettingsForm />
      </AdminCard>

      <AdminCard
        title="RH — Paie & devises"
        icon={ADMIN_CARD_ICONS.hrPayroll}
        className="lg:col-span-2"
      >
        <HrPayrollSettingsForm />
      </AdminCard>

      <AdminCard title="Identité" icon={ADMIN_CARD_ICONS.identity}>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted">Nom</dt>
            <dd className="mt-1 font-medium text-foreground">
              {data.identity.name}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Raison sociale</dt>
            <dd className="mt-1 text-foreground">{data.identity.legalName}</dd>
          </div>
          <div>
            <dt className="text-muted">Fondée le</dt>
            <dd className="mt-1 text-foreground">{data.identity.founded}</dd>
          </div>
        </dl>
      </AdminCard>

      <AdminCard title="Contact public" icon={ADMIN_CARD_ICONS.contactPublic}>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-1 text-foreground">{data.contact.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Téléphone</dt>
            <dd className="mt-1 text-foreground">{data.contact.phoneDisplay}</dd>
          </div>
          <div>
            <dt className="text-muted">Adresse</dt>
            <dd className="mt-1 text-foreground">
              {data.contact.addressLine1}
              <br />
              {data.contact.addressLine2}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">
          Texte contact site : « {data.publicCta.title} » — modifiable dans{" "}
          <Link href="/admin/cms" className="text-gold hover:underline">
            CMS → Contact
          </Link>
          .
        </p>
      </AdminCard>

      <AdminCard title="État du système" icon={ADMIN_CARD_ICONS.system} className="lg:col-span-2">
        <ul className="grid gap-4 sm:grid-cols-2">
          <StatusRow
            ok={data.security.neonAuthConfigured}
            label="Neon Auth"
            detail={
              data.security.neonAuthConfigured
                ? "Authentification active"
                : "NEON_AUTH_BASE_URL manquant"
            }
          />
          <StatusRow
            ok={data.email.configured}
            label="SMTP"
            detail={
              data.email.configured
                ? `Expéditeur : ${data.email.fromAddress}`
                : "Serveur SMTP non configuré"
            }
          />
          <StatusRow
            ok={data.email.enabled}
            label="Emails automatiques"
            detail={
              data.email.enabled
                ? `Notifications → ${data.email.adminNotifyTo}`
                : "Désactivés ou incomplets"
            }
          />
          <StatusRow
            ok={data.security.cloudinaryConfigured}
            label="Cloudinary (images CMS)"
            detail={
              data.security.cloudinaryConfigured
                ? "Uploads stockés sur res.cloudinary.com"
                : "CLOUDINARY_URL non configuré"
            }
          />
          <StatusRow
            ok={data.security.cronConfigured}
            label="Rappels événements (cron)"
            detail={
              data.security.cronConfigured
                ? `Paliers : ${data.reminders.thresholds.join(", ")} j`
                : "CRON_SECRET à définir sur Vercel"
            }
          />
          <StatusRow
            ok={Boolean(data.security.appUrl)}
            label="URL application"
            detail={data.security.appUrl ?? "NEXT_PUBLIC_APP_URL non défini"}
          />
          <StatusRow
            ok={data.reminders.active}
            label="Rappels admin"
            detail="Notifications in-app + email à l'ouverture du panneau"
          />
        </ul>
      </AdminCard>

      <AdminCard
        title="Emails — devis & notifications"
        icon={ADMIN_CARD_ICONS.email}
        className="lg:col-span-2"
      >
        <EmailSettingsForm />
      </AdminCard>

      <AdminCard title="Sécurité" icon={ADMIN_CARD_ICONS.security} className="lg:col-span-2">
        <p className="text-sm leading-relaxed text-muted">
          Authentification via <strong>Neon Auth</strong>. Les comptes panneau
          sont créés par un administrateur dans{" "}
          <Link
            href="/admin/utilisateurs"
            className="text-foreground underline-offset-2 hover:text-gold hover:underline"
          >
            Utilisateurs
          </Link>
          . Les rôles et permissions sont détaillés dans{" "}
          <Link
            href="/admin/acces"
            className="text-foreground underline-offset-2 hover:text-gold hover:underline"
          >
            Rôles & accès
          </Link>
          .
        </p>
      </AdminCard>
    </div>
  );
}
