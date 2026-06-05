import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { brand } from "@/config/brand";

export default function AdminLoginPage() {
  return (
    <div className="admin-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border border-border bg-surface p-8 shadow-lg sm:p-10">
        <p className="font-display text-2xl text-foreground">{brand.name}</p>
        <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-gold uppercase">
          Connexion panneau
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-muted">Chargement…</p>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
