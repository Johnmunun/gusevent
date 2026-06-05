"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { UserFormDrawer, type UserRow } from "@/components/admin/users/UserFormDrawer";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { useAdminApp } from "@/components/admin/admin-app-context";

export function UsersManager() {
  const appSession = useAdminApp();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function removeUser(id: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          Créez des comptes avec un rôle : chaque rôle définit les modules accessibles dans le panneau.
        </p>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-medium text-cream"
        >
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </button>
      </div>

      <AdminCard title="Équipe" noPadding>
        {loading ? (
          <p className="p-6 text-sm text-muted">Chargement…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-cream/80 text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Rôle</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-cream/50">
                    <td className="px-5 py-4 font-medium">{user.name}</td>
                    <td className="px-5 py-4 text-muted">{user.email}</td>
                    <td className="px-5 py-4">{ROLE_LABELS[user.role]}</td>
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
