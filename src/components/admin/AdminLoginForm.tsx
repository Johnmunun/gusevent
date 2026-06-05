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
  const [email, setEmail] = useState("admin@gusevent.com");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Administrateur");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    try {
      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({
          email: normalizedEmail,
          password,
          name: name.trim() || "Administrateur",
        });

        if (signUpError) {
          const msg = signUpError.message ?? "";
          const alreadyExists = /already|exist|registered|422/i.test(msg);
          if (alreadyExists) {
            setInfo("Compte déjà créé. Connexion en cours…");
          } else {
            setError(msg || "Impossible de créer le compte.");
            return;
          }
        } else {
          setInfo("Compte créé. Connexion en cours…");
        }

      }

      const { error: signInError } = await authClient.signIn.email({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        setError(
          signInError.message?.includes("Invalid email or password")
            ? "Email ou mot de passe incorrect. Si c’est la première fois, créez d’abord le compte (bouton ci-dessous)."
            : signInError.message ?? "Connexion impossible."
        );
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
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
        setError("Délai dépassé. Vérifiez la base de données et redémarrez le serveur.");
      } else {
        setError("Erreur réseau. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBootstrap() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bootstrap-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password || undefined,
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Échec de la configuration");
        return;
      }
      setInfo(data.message ?? "Compte configuré. Connectez-vous maintenant.");
      setMode("login");
      if (!password) {
        setPassword("Admin123!");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  if (configError === "db") {
    return (
      <p className="mt-8 border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
        Impossible de joindre la base PostgreSQL. Vérifiez{" "}
        <code className="text-xs">DATABASE_URL</code> dans{" "}
        <code className="text-xs">.env</code> (sans{" "}
        <code className="text-xs">channel_binding=require</code> sous Windows),
        puis <code className="text-xs">npm run db:seed</code> et redémarrez{" "}
        <code className="text-xs">npm run dev</code>.
      </p>
    );
  }

  if (configError === "neon_auth") {
    return (
      <p className="mt-8 border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
        Neon Auth n&apos;est pas configuré. Ajoutez{" "}
        <code className="text-xs">NEON_AUTH_BASE_URL</code> dans votre fichier{" "}
        <code className="text-xs">.env</code>, puis redémarrez le serveur.
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
      {info && (
        <p className="border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-foreground">
          {info}
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

        {mode === "signup" && (
          <div>
            <label
              htmlFor="name"
              className="text-xs font-semibold tracking-wide text-muted uppercase"
            >
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full border border-border bg-cream px-3 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
        )}

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
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Min. 8 caractères" : ""}
            className="mt-1.5 w-full border border-border bg-cream px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 bg-ink px-4 py-3 text-sm font-medium text-cream transition-colors hover:bg-stone-800 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signup" ? "Créer le compte et se connecter" : "Se connecter"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
        }}
        className="w-full text-center text-xs text-muted underline-offset-2 hover:text-gold hover:underline"
      >
        {mode === "login"
          ? "Première visite ? Créer un compte"
          : "Déjà un compte ? Se connecter"}
      </button>

      <button
        type="button"
        disabled={loading || !password}
        onClick={handleBootstrap}
        className="w-full border border-border bg-surface px-3 py-2 text-xs text-muted hover:border-gold/40"
      >
        Configurer automatiquement (Neon Auth + profil admin)
      </button>

      <p className="text-center text-xs text-muted">
        Le profil Prisma <strong>admin@gusevent.com</strong> doit exister (fait par{" "}
        <code className="text-[10px]">npm run db:seed</code>).
      </p>
    </div>
  );
}
