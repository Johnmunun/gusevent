"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Shield, Users } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import type { SystemAccessData } from "@/lib/system/service";

export function AccessPageView() {
  const [data, setData] = useState<SystemAccessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/system/access", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then((json: SystemAccessData) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-12 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des rôles…
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted">Impossible de charger les accès.</p>
    );
  }

  return (
    <>
      <div className="admin-welcome mb-8 flex items-start gap-4 px-5 py-5 text-cream sm:px-6">
        <Shield className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
        <div>
          <p className="font-display text-xl">Matrice des permissions</p>
          <p className="mt-2 text-sm text-stone-400">
            {data.activeUsers} compte{data.activeUsers > 1 ? "s" : ""} actif
            {data.activeUsers > 1 ? "s" : ""} sur {data.totalUsers} utilisateur
            {data.totalUsers > 1 ? "s" : ""} — assignez un rôle dans{" "}
            <Link href="/admin/utilisateurs" className="text-gold hover:underline">
              Utilisateurs
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Utilisateurs"
          value={String(data.totalUsers)}
          hint={`${data.activeUsers} actifs`}
          trend={data.activeUsers > 0 ? "up" : "neutral"}
        />
        {data.roles.slice(0, 3).map((role, i) => (
          <AdminStatCard
            key={role.role}
            index={i + 1}
            label={role.label}
            value={String(role.userCount)}
            hint={`${role.permissions.length} permissions`}
            trend={role.userCount > 0 ? "up" : "neutral"}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {data.roles.map((role) => (
          <AdminCard key={role.role} title={role.label}>
            <p className="text-sm leading-relaxed text-muted">
              {role.description}
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Users className="h-3.5 w-3.5" />
              {role.userCount} membre{role.userCount > 1 ? "s" : ""}
            </div>

            {role.members.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {role.members.map((member) => (
                  <li
                    key={member.id}
                    className={`border px-2.5 py-1 text-xs ${
                      member.active
                        ? "border-border bg-cream/50 text-foreground"
                        : "border-stone-200 bg-stone-50 text-stone-400"
                    }`}
                    title={member.email}
                  >
                    {member.name}
                    {!member.active && " (inactif)"}
                  </li>
                ))}
              </ul>
            )}

            <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
              {role.permissions.map((perm) => (
                <li key={perm.key} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 bg-gold" />
                  {perm.label}
                </li>
              ))}
            </ul>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
