"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Upload } from "lucide-react";
import {
  cloudinaryPreviewUrl,
  isCloudinaryUrl,
} from "@/lib/cloudinary/utils";

type CmsImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

export function CmsImageField({ label, value, onChange, hint }: CmsImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewError, setPreviewError] = useState(false);
  /** Aperçu immédiat (blob ou URL Cloudinary avant sync parent). */
  const [instantPreview, setInstantPreview] = useState<string | null>(null);

  const displayUrl = instantPreview ?? value;
  const imgSrc = displayUrl ? cloudinaryPreviewUrl(displayUrl) : "";

  useEffect(() => {
    if (instantPreview?.startsWith("blob:")) {
      return () => URL.revokeObjectURL(instantPreview);
    }
  }, [instantPreview]);

  useEffect(() => {
    if (instantPreview && value && value === instantPreview) {
      setInstantPreview(null);
    }
  }, [value, instantPreview]);

  useEffect(() => {
    setPreviewError(false);
  }, [displayUrl]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (instantPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(instantPreview);
    }

    setInstantPreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadError("");
    setPreviewError(false);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/cms/upload", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
        setInstantPreview(data.url);
      } else {
        setUploadError(data.error ?? "Échec du téléversement");
      }
    } catch {
      setUploadError("Erreur réseau");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const providerLabel = isCloudinaryUrl(value || displayUrl)
    ? "Cloudinary"
    : displayUrl.startsWith("/uploads/")
      ? "Local"
      : displayUrl.startsWith("/media/")
        ? "Média local"
        : instantPreview?.startsWith("blob:")
          ? "Aperçu local"
          : null;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setInstantPreview(null);
        }}
        className="w-full border border-border bg-cream px-3 py-2 text-sm outline-none focus:border-gold/50"
        placeholder="https://res.cloudinary.com/… ou /media/…"
      />
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {providerLabel && (
        <p className="text-[10px] font-medium uppercase tracking-wide text-gold">
          Source : {providerLabel}
        </p>
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 border border-border bg-surface px-3 py-2 text-xs font-medium hover:border-gold/40">
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {uploading ? "Téléversement…" : "Téléverser sur Cloudinary"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
      </label>
      {uploadError && (
        <p className="text-xs text-red-700">{uploadError}</p>
      )}

      {displayUrl ? (
        <div className="mt-2 overflow-hidden border border-border bg-stone-100">
          {!previewError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={imgSrc}
              src={imgSrc}
              alt="Aperçu"
              className="mx-auto block max-h-48 w-full max-w-md object-contain p-2"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="space-y-2 px-4 py-6 text-center text-xs text-muted">
              <p>Impossible d&apos;afficher l&apos;aperçu ici.</p>
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gold hover:underline"
              >
                Ouvrir l&apos;image
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
