"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { EmailSettings } from "@/lib/settings/email-settings";

const inputClass =
  "mt-1.5 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold/50";

const labelClass = "text-xs font-semibold tracking-wide text-muted uppercase";

export function EmailSettingsForm() {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [testTo, setTestTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/email")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => setError("Impossible de charger la configuration"))
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(sendTest = false) {
    if (!settings) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          ...(sendTest && testTo ? { testTo } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Échec de l'enregistrement");
        return;
      }
      setSettings(data.settings);
      if (sendTest && data.test) {
        setMessage(
          data.test.ok
            ? "Configuration enregistrée et email de test envoyé."
            : `Configuration enregistrée, mais test échoué : ${data.test.error}`
        );
      } else {
        setMessage("Configuration enregistrée.");
      }
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
    return <p className="text-sm text-red-700">{error || "Configuration indisponible"}</p>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p className="border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-foreground">
          {message}
        </p>
      )}

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => update("enabled", e.target.checked)}
          className="h-4 w-4 accent-gold"
        />
        Activer l&apos;envoi d&apos;emails automatiques
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nom expéditeur</label>
          <input
            className={inputClass}
            value={settings.fromName}
            onChange={(e) => update("fromName", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Email expéditeur</label>
          <input
            type="email"
            className={inputClass}
            value={settings.fromAddress}
            onChange={(e) => update("fromAddress", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Email admin (notifications devis)</label>
          <input
            type="email"
            className={inputClass}
            value={settings.adminNotifyTo}
            onChange={(e) => update("adminNotifyTo", e.target.value)}
          />
        </div>
      </div>

      <div>
        <p className="font-display text-lg text-foreground">Serveur SMTP</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Hôte</label>
            <input
              className={inputClass}
              placeholder="smtp.gmail.com"
              value={settings.smtpHost}
              onChange={(e) => update("smtpHost", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Port</label>
            <input
              type="number"
              className={inputClass}
              value={settings.smtpPort}
              onChange={(e) => update("smtpPort", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Utilisateur SMTP</label>
            <input
              className={inputClass}
              value={settings.smtpUser}
              onChange={(e) => update("smtpUser", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Mot de passe SMTP</label>
            <input
              type="password"
              className={inputClass}
              value={settings.smtpPassword}
              onChange={(e) => update("smtpPassword", e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.smtpSecure}
            onChange={(e) => update("smtpSecure", e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Connexion sécurisée (SSL/TLS — port 465)
        </label>
      </div>

      <div>
        <p className="font-display text-lg text-foreground">Modèles d&apos;emails</p>
        <p className="mt-1 text-xs text-muted">
          Variables : {"{{reference}}"}, {"{{fullName}}"}, {"{{email}}"}, {"{{eventType}}"},
          {" {{budgetLabel}}"}, {"{{modifyLink}}"}, {"{{adminLink}}"}, etc.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Sujet — confirmation client</label>
            <input
              className={inputClass}
              value={settings.clientSubject}
              onChange={(e) => update("clientSubject", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Corps — confirmation client</label>
            <textarea
              rows={8}
              className={inputClass}
              value={settings.clientBody}
              onChange={(e) => update("clientBody", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Sujet — notification admin</label>
            <input
              className={inputClass}
              value={settings.adminSubject}
              onChange={(e) => update("adminSubject", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Corps — notification admin</label>
            <textarea
              rows={8}
              className={inputClass}
              value={settings.adminBody}
              onChange={(e) => update("adminBody", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className={labelClass}>Email de test</label>
          <input
            type="email"
            className={inputClass}
            placeholder="vous@exemple.com"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave(false)}
          className="bg-ink px-6 py-3 text-sm font-medium text-cream disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          disabled={saving || !testTo}
          onClick={() => handleSave(true)}
          className="border border-border bg-surface px-6 py-3 text-sm font-medium disabled:opacity-60"
        >
          Enregistrer &amp; tester
        </button>
      </div>
    </div>
  );
}
