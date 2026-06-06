"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { currencies } from "@/lib/quote";
import type { HrPayrollSettings } from "@/lib/settings/hr-settings-types";
import { getCurrencyMeta } from "@/lib/settings/hr-settings-types";

const inputClass =
  "mt-1.5 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold/50";

const labelClass = "text-xs font-semibold tracking-wide text-muted uppercase";

export function HrPayrollSettingsForm() {
  const [settings, setSettings] = useState<HrPayrollSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/hr", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: HrPayrollSettings) => setSettings(data))
      .catch(() => setError("Impossible de charger les paramètres RH"))
      .finally(() => setLoading(false));
  }, []);

  function updateRate(code: string, value: string) {
    setSettings((prev) => {
      if (!prev) return prev;
      const parsed = Number.parseFloat(value);
      return {
        ...prev,
        exchangeRates: {
          ...prev.exchangeRates,
          [code]: Number.isFinite(parsed) && parsed > 0 ? parsed : 1,
        },
      };
    });
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings/hr", {
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
      setMessage("Paramètres paie enregistrés — utilisés pour les bulletins et exports.");
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

  const defaultMeta = getCurrencyMeta(settings.defaultCurrency);

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        Devise par défaut pour les salaires, bulletins et exports Excel. Les
        taux servent à convertir entre devises si besoin (1 unité de la devise
        = X {defaultMeta.code}).
      </p>

      <div>
        <label className={labelClass}>Devise par défaut (paie)</label>
        <select
          value={settings.defaultCurrency}
          onChange={(e) =>
            setSettings((prev) =>
              prev
                ? {
                    ...prev,
                    defaultCurrency: e.target.value as HrPayrollSettings["defaultCurrency"],
                    exchangeRates: {
                      ...prev.exchangeRates,
                      [e.target.value]: 1,
                    },
                  }
                : prev
            )
          }
          className={inputClass}
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label} ({c.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className={labelClass}>Taux de change</p>
        <div className="mt-2 space-y-3">
          {currencies.map((c) => {
            const isDefault = c.code === settings.defaultCurrency;
            const rate = settings.exchangeRates[c.code] ?? 1;

            return (
              <div
                key={c.code}
                className="grid gap-2 border border-border/80 bg-cream/20 px-4 py-3 sm:grid-cols-[1fr_140px]"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {c.label} ({c.code})
                  </p>
                  <p className="text-xs text-muted">
                    {isDefault
                      ? "Devise de référence — taux fixé à 1"
                      : `1 ${c.code} = … ${settings.defaultCurrency}`}
                  </p>
                </div>
                <input
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  disabled={isDefault}
                  value={isDefault ? 1 : rate}
                  onChange={(e) => updateRate(c.code, e.target.value)}
                  className={`${inputClass} mt-0`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-stone-800 disabled:opacity-60"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
