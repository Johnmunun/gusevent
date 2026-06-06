"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Pencil, Trash2, UserCog } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { ADMIN_CARD_ICONS } from "@/lib/admin/card-icons";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  UserFormDrawer,
  type UserRow,
} from "@/components/admin/users/UserFormDrawer";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { useAdminApp } from "@/components/admin/admin-app-context";
import type { AdminRole } from "@prisma/client";

export function UsersManager() {
  const appSession = useAdminApp();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.active).length;
    const byRole = users.reduce(
      (acc, u) => {
        acc[u.role] = (acc[u.role] ?? 0) + 1;
        return acc;
      },
      {} as Partial<Record<AdminRole, number>>
    );
    return { total: users.length, active, inactive: users.length - active, byRole };
  }, [users]);

  async function removeUser(id: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <>
      <div className="admin-welcome mb-8 flex flex-wrap items-center justify-between gap-4 px-5 py-5 text-cream sm:px-6">
        <div className="flex items-start gap-3">
          <UserCog className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
          <div>
            <p className="font-display text-xl">Équipe admin</p>
            <p className="mt-2 text-sm text-stone-400">
              {stats.total} compte{stats.total > 1 ? "s" : ""} — chaque rôle
              définit les modules accessibles. Voir la matrice dans{" "}
              <Link href="/admin/acces" className="text-gold hover:underline">
                Rôles & accès
              </Link>
              .
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
          className="inline-flex items-center gap-2 border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-ink"
        >
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </button>
      </div>

      {!loading && stats.total > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="Total"
            value={String(stats.total)}
            hint={`${stats.active} actifs`}
            trend="neutral"
          />
          <AdminStatCard
            label="Actifs"
            value={String(stats.active)}
            hint={
              stats.inactive > 0
                ? `${stats.inactive} inactif${stats.inactive > 1 ? "s" : ""}`
                : "Tous actifs"
            }
            trend={stats.active > 0 ? "up" : "neutral"}
          />
          <AdminStatCard
            label="Administrateurs"
            value={String(
              (stats.byRole.ADMIN ?? 0) + (stats.byRole.SUPER_ADMIN ?? 0)
            )}
            hint="ADMIN + Super admin"
            trend="neutral"
          />
          <AdminStatCard
            label="Éditeurs"
            value={String(stats.byRole.EDITOR ?? 0)}
            hint={`${stats.byRole.VIEWER ?? 0} lecteur${(stats.byRole.VIEWER ?? 0) > 1 ? "s" : ""}`}
            trend="neutral"
          />
        </div>
      )}

      <AdminCard title="Comptes" icon={ADMIN_CARD_ICONS.accounts} noPadding>
        {loading ? (
          <p className="flex items-center gap-2 p-6 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement des utilisateurs…
          </p>
        ) : users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <UserCog className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 text-sm text-muted">
              Aucun utilisateur. Créez le premier compte pour donner accès au
              panneau.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setDrawerOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm font-medium text-cream"
            >
              <Plus className="h-4 w-4" />
              Créer un utilisateur
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-cream/80 text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Rôle</th>
                  <th className="px-5 py-3">Neon Auth</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-cream/50">
                    <td className="px-5 py-4 font-medium">{user.name}</td>
                    <td className="px-5 py-4 text-muted">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className="bg-ink/5 px-2 py-0.5 text-xs font-medium text-foreground ring-1 ring-border">
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          user.neonAuthId
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }
                      >
                        {user.neonAuthId ? "Lié" : "En attente"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          user.active
                            ? "text-emerald-700"
                            : "text-stone-400"
                        }
                      >
                        {user.active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(user);
                          setDrawerOpen(true);
                        }}
                        className="mr-2 inline-flex p-2 text-muted hover:text-gold"
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {appSession?.user.id !== user.id && (
                        <button
                          type="button"
                          onClick={() => removeUser(user.id)}
                          className="inline-flex p-2 text-muted hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <UserFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={editing}
        onSaved={load}
      />
    </>
  );
}
