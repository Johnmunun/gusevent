"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { CmsImageField } from "@/components/admin/cms/CmsImageField";
import { brand } from "@/config/brand";
import {
  cloudinaryPreviewUrl,
  isCloudinaryUrl,
} from "@/lib/cloudinary/utils";
import {
  DEFAULT_LOGO_CHAIN,
  type LogoSettings,
} from "@/lib/settings/logo-types";
import { cn } from "@/lib/utils";

function previewSrc(url: string) {
  if (!url) return "";
  return isCloudinaryUrl(url) ? cloudinaryPreviewUrl(url) : url;
}

function NavbarLogoPreview({
  url,
  showText,
  variant,
}: {
  url: string;
  showText: boolean;
  variant: "hero" | "scrolled";
}) {
  const onHero = variant === "hero";
  const displayUrl = url || DEFAULT_LOGO_CHAIN[0];

  return (
    <div
      className={cn(
        "flex h-14 items-center justify-between border px-4",
        onHero
          ? "border-stone-700 bg-ink text-white"
          : "border-border bg-cream/95 text-foreground"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="relative flex h-9 shrink-0 items-center sm:h-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc(displayUrl)}
            alt=""
            className="h-9 w-auto max-w-[9rem] object-contain object-left sm:h-10 sm:max-w-[11rem]"
          />
        </span>
        {showText && (
          <span
            className={cn(
              "truncate font-display text-lg font-semibold tracking-tight",
              onHero ? "text-white" : "text-stone-900"
            )}
          >
            {brand.name}
          </span>
        )}
      </div>
      <span
        className={cn(
          "hidden text-xs sm:inline",
          onHero ? "text-white/50" : "text-muted"
        )}
      >
        Aperçu navbar
      </span>
    </div>
  );
}

export function LogoSettingsForm() {
  const [settings, setSettings] = useState<LogoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/logo", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: LogoSettings) => setSettings(data))
      .catch(() => setError("Impossible de charger le logo"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings/logo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Échec de l'enregistrement");
        return;
      }
      setSettings(data.settings);
      setMessage("Logo enregistré — le site public est à jour.");
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setSettings({ url: "", showText: true });
    setMessage("");
    setError("");
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement…
      </p>
    );
  }

  if (!settings) {
    return <p className="text-sm text-red-700">{error || "Indisponible"}</p>;
  }

  return (
    <div className="space-y-6">
      <CmsImageField
        label="Logo"
        value={settings.url}
        onChange={(url) => setSettings((s) => (s ? { ...s, url } : s))}
        hint="PNG, SVG (via URL), WebP ou JPG. Laissez vide pour utiliser les fichiers dans public/media/ (logo.svg, logo.png…)."
      />

      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={settings.showText}
          onChange={(e) =>
            setSettings((s) =>
              s ? { ...s, showText: e.target.checked } : s
            )
          }
          className="mt-1 h-4 w-4 accent-gold"
        />
        <span>
          <span className="font-medium text-foreground">
            Afficher le nom « {brand.name} » à côté du logo
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            Décochez si votre logo contient déjà le nom (format horizontal).
          </span>
        </span>
      </label>

      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          Aperçu dans la barre de navigation
        </p>
        <NavbarLogoPreview
          url={settings.url}
          showText={settings.showText}
          variant="hero"
        />
        <NavbarLogoPreview
          url={settings.url}
          showText={settings.showText}
          variant="scrolled"
        />
      </div>

      {message && (
        <p className="text-sm text-emerald-700">{message}</p>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-medium text-cream hover:bg-stone-800 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer le logo
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm text-muted hover:border-gold/40 hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser (défaut)
        </button>
      </div>

      {!settings.url && (
        <p className="text-xs text-muted">
          Logo actuel : fichiers locaux{" "}
          <code className="text-foreground">public/media/logo.*</code>
        </p>
      )}
    </div>
  );
}
