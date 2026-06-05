"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { AdminRole } from "@prisma/client";
import { Drawer } from "@/components/ui/Drawer";
import { ROLE_LABELS } from "@/lib/auth/permissions";

export type UserRow = {
  id: string;
  neonAuthId?: string | null;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  active: boolean;
};

type UserFormDrawerProps = {
  open: boolean;
  onClose: () => void;
  user?: UserRow | null;
  onSaved: () => void;
};

const roles: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"];

export function UserFormDrawer({ open, onClose, user, onSaved }: UserFormDrawerProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("EDITOR");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setActive(user.active);
      setPassword("");
    } else {
      setName("");
      setEmail("");
      setRole("EDITOR");
      setActive(true);
      setPassword("");
    }
    setError("");
  }, [user, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body: Record<string, unknown> = { name, email, role, active };
    if (password) body.password = password;

    const url = user ? `/api/admin/users/${user.id}` : "/api/admin/users";
    const method = user ? "PATCH" : "POST";

    if (!user && !password) {
      setError("Mot de passe requis pour un nouvel utilisateur.");
      setSaving(false);
      return;
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur");
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <Drawer open={open} onClose={onClose} title={user ? "Modifier l'utilisateur" : "Nouvel utilisateur"}>
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {error && (
          <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
        <div>
          <label className="text-xs font-semibold text-muted uppercase">Nom</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase">
            {user ? "Mot de passe (Neon Auth — non modifiable ici)" : "Mot de passe Neon Auth"}
          </label>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!!user}
            className="mt-1 w-full border border-border px-3 py-2 text-sm disabled:bg-cream/60"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase">Rôle</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className="mt-1 w-full border border-border px-3 py-2 text-sm"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Compte actif
        </label>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-ink py-2.5 text-sm font-medium text-cream disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button type="button" onClick={onClose} className="border border-border px-4 py-2.5 text-sm">
            <X className="h-4 w-4" />
          </button>
        </div>
      </form>
    </Drawer>
  );
}
