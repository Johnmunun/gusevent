"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const configError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        setError(
          signInError.message?.includes("Invalid email or password")
            ? "Email ou mot de passe incorrect."
            : signInError.message ?? "Connexion impossible."
        );
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const me = await fetch("/api/admin/me", { signal: controller.signal });
      clearTimeout(timeout);

      if (!me.ok) {
        router.push("/admin/unauthorized");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Délai dépassé. Réessayez dans quelques instants.");
      } else {
        setError("Erreur réseau. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (configError === "db" || configError === "slow") {
    return (
      <div className="mt-8 space-y-4">
        <p className="border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
          {configError === "slow"
            ? "La vérification a pris trop de temps (souvent au premier chargement après redémarrage). La base fonctionne peut‑être encore — reconnectez-vous."
            : "Impossible de joindre la base de données. Vérifiez DATABASE_URL puis redémarrez le serveur."}
        </p>
        <button
          type="button"
          onClick={() =>
            router.replace(
              `/admin/login${callbackUrl !== "/admin" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`
            )
          }
          className="w-full bg-ink px-4 py-3 text-sm font-medium text-cream hover:bg-stone-800"
        >
          Réessayer la connexion
        </button>
      </div>
    );
  }

  if (configError === "neon_auth") {
    return (
      <p className="mt-8 border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
        Connexion indisponible. Contactez l&apos;administrateur technique.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="text-xs font-semibold tracking-wide text-muted uppercase"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full border border-border bg-cream px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-xs font-semibold tracking-wide text-muted uppercase"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full border border-border bg-cream px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 bg-ink px-4 py-3 text-sm font-medium text-cream transition-colors hover:bg-stone-800 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Se connecter
        </button>
      </form>
    </div>
  );
}
