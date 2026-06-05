"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ContactSettings } from "@/lib/settings/contact-types";
import { whatsappLink } from "@/lib/settings/contact-types";

const inputClass =
  "mt-1.5 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold/50";

const labelClass = "text-xs font-semibold tracking-wide text-muted uppercase";

export function ContactSettingsForm() {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/contact", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: ContactSettings) => setSettings(data))
      .catch(() => setError("Impossible de charger les coordonnées"))
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof ContactSettings>(key: K, value: ContactSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Échec de l'enregistrement");
        return;
      }
      setSettings(data.settings);
      setMessage("Coordonnées enregistrées — le site public est à jour.");
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
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

  const waPreview = whatsappLink(settings.whatsapp || settings.phone);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Email public</label>
          <input
            type="email"
            className={inputClass}
            value={settings.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Téléphone (lien tel:)</label>
          <input
            className={inputClass}
            value={settings.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+216…"
          />
        </div>
        <div>
          <label className={labelClass}>Affichage téléphone</label>
          <input
            className={inputClass}
            value={settings.phoneDisplay}
            onChange={(e) => update("phoneDisplay", e.target.value)}
            placeholder="+216 58 778 309"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>WhatsApp</label>
          <input
            className={inputClass}
            value={settings.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="+21658778309"
          />
          {waPreview ? (
            <p className="mt-1 text-[10px] text-muted">
              Lien généré :{" "}
              <a href={waPreview} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                {waPreview}
              </a>
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass}>Adresse — ligne 1</label>
          <input
            className={inputClass}
            value={settings.addressLine1}
            onChange={(e) => update("addressLine1", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Adresse — ligne 2</label>
          <input
            className={inputClass}
            value={settings.addressLine2}
            onChange={(e) => update("addressLine2", e.target.value)}
          />
        </div>
      </div>

      <div>
        <p className={labelClass}>Réseaux sociaux (footer)</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-1">
          <div>
            <label className="text-xs text-muted">Instagram</label>
            <input
              className={inputClass}
              value={settings.instagram}
              onChange={(e) => update("instagram", e.target.value)}
              placeholder="https://www.instagram.com/…"
            />
          </div>
          <div>
            <label className="text-xs text-muted">LinkedIn</label>
            <input
              className={inputClass}
              value={settings.linkedin}
              onChange={(e) => update("linkedin", e.target.value)}
              placeholder="https://www.linkedin.com/company/…"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Facebook</label>
            <input
              className={inputClass}
              value={settings.facebook}
              onChange={(e) => update("facebook", e.target.value)}
              placeholder="https://www.facebook.com/…"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Laissez vide pour masquer un réseau dans le pied de page.
        </p>
      </div>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-medium text-cream hover:bg-stone-800 disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Enregistrer les coordonnées
      </button>
    </div>
  );
}
