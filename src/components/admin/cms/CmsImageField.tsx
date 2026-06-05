"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";

type CmsImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

export function CmsImageField({ label, value, onChange, hint }: CmsImageFieldProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/cms/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.url) onChange(data.url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-cream px-3 py-2 text-sm outline-none focus:border-gold/50"
        placeholder="/media/..."
      />
      {hint && <p className="text-xs text-muted">{hint}</p>}
      <label className="inline-flex cursor-pointer items-center gap-2 border border-border bg-surface px-3 py-2 text-xs font-medium hover:border-gold/40">
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        Téléverser une image
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-2 h-24 w-auto max-w-full border border-border object-cover" />
      )}
    </div>
  );
}
