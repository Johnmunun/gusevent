"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  GripVertical,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { CmsImageField } from "@/components/admin/cms/CmsImageField";
import {
  CmsFormField,
  cmsInputClass,
  cmsTextareaClass,
} from "@/components/admin/cms/CmsFormField";
import { cloudinaryPreviewUrl, isCloudinaryUrl } from "@/lib/cloudinary/utils";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "mariages", label: "Mariages" },
  { id: "corporate", label: "Corporate" },
  { id: "concerts", label: "Concerts" },
  { id: "conferences", label: "Conférences" },
] as const;

type GalleryItem = Record<string, unknown>;

type GalleryCmsEditorProps = {
  content: Record<string, unknown>;
  setContent: (c: unknown) => void;
  onSave: () => void;
  saving: boolean;
  message: string;
};

function previewSrc(url: string) {
  if (!url) return "";
  return isCloudinaryUrl(url) ? cloudinaryPreviewUrl(url) : url;
}

export function GalleryCmsEditor({
  content,
  setContent,
  onSave,
  saving,
  message,
}: GalleryCmsEditorProps) {
  const heading = (content.heading ?? {}) as Record<string, string>;
  const items = (content.items ?? []) as GalleryItem[];
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, selectedIndex]);

  const selected = items[selectedIndex];

  function updateItems(next: GalleryItem[]) {
    setContent({ ...content, items: next });
  }

  function updateItem(index: number, patch: Partial<GalleryItem>) {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    updateItems(next);
  }

  function addProject() {
    const newItem: GalleryItem = {
      id: `gal_${Date.now()}`,
      title: "Nouveau projet",
      category: "mariages",
      image: "/media/gallery/01.jpg",
      sources: ["/media/gallery/01.jpg"],
      span: "normal",
    };
    updateItems([...items, newItem]);
    setSelectedIndex(items.length);
  }

  function removeProject(index: number) {
    if (!confirm("Supprimer ce projet de la galerie ?")) return;
    updateItems(items.filter((_, i) => i !== index));
  }

  const categoryLabel = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="space-y-6">
      <div className="admin-welcome flex flex-wrap items-center justify-between gap-4 px-5 py-5 text-cream sm:px-6">
        <div className="flex items-start gap-3">
          <ImageIcon className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
          <div>
            <p className="font-display text-xl">Galerie — Réalisations</p>
            <p className="mt-2 text-sm text-stone-400">
              {items.length} projet{items.length > 1 ? "s" : ""} affiché
              {items.length > 1 ? "s" : ""} sur la landing (#realisations).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/#realisations"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-stone-600 px-3 py-2 text-xs text-stone-300 hover:border-gold/40 hover:text-gold"
          >
            Voir sur le site
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-ink disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </button>
        </div>
      </div>

      {message && (
        <p className="border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      )}

      <AdminCard title="Texte de la section" hover={false}>
        <div className="grid gap-4 sm:grid-cols-3">
          <CmsFormField label="Surtitre">
            <input
              className={cmsInputClass}
              value={heading.eyebrow ?? ""}
              onChange={(e) =>
                setContent({
                  ...content,
                  heading: { ...heading, eyebrow: e.target.value },
                })
              }
            />
          </CmsFormField>
          <CmsFormField label="Titre">
            <input
              className={cmsInputClass}
              value={heading.title ?? ""}
              onChange={(e) =>
                setContent({
                  ...content,
                  heading: { ...heading, title: e.target.value },
                })
              }
            />
          </CmsFormField>
          <CmsFormField label="Description" className="sm:col-span-3">
            <textarea
              className={cmsTextareaClass}
              rows={2}
              value={heading.description ?? ""}
              onChange={(e) =>
                setContent({
                  ...content,
                  heading: { ...heading, description: e.target.value },
                })
              }
            />
          </CmsFormField>
        </div>
      </AdminCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <AdminCard
          title={`Projets (${items.length})`}
          hover={false}
          action={
            <button
              type="button"
              onClick={addProject}
              className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          }
          noPadding
        >
          {items.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Aucun projet. Cliquez sur Ajouter pour commencer.
            </p>
          ) : (
            <ul className="max-h-[32rem] divide-y divide-border overflow-y-auto">
              {items.map((item, i) => {
                const img = String(item.image ?? "");
                const isActive = i === selectedIndex;
                return (
                  <li key={String(item.id ?? i)}>
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(i)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                        isActive
                          ? "bg-gold/10 ring-1 ring-inset ring-gold/40"
                          : "hover:bg-cream/60"
                      )}
                    >
                      <GripVertical className="h-4 w-4 shrink-0 text-stone-300" />
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-ink">
                        {img ? (
                          <Image
                            src={previewSrc(img) || img}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized={!img.startsWith("https://")}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-stone-500">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {String(item.title ?? "Sans titre")}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {categoryLabel(String(item.category ?? ""))}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>

        <div>
          {!selected ? (
            <AdminCard hover={false}>
              <p className="py-16 text-center text-sm text-muted">
                Sélectionnez un projet dans la liste ou ajoutez-en un nouveau.
              </p>
            </AdminCard>
          ) : (
            <AdminCard
              title={`Édition — ${String(selected.title ?? "Projet")}`}
              hover={false}
              action={
                <button
                  type="button"
                  onClick={() => removeProject(selectedIndex)}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              }
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="relative aspect-[4/3] overflow-hidden border border-border bg-ink">
                  {String(selected.image ?? "") ? (
                    <Image
                      src={
                        previewSrc(String(selected.image)) ||
                        String(selected.image)
                      }
                      alt={String(selected.title ?? "")}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 400px"
                      unoptimized={!String(selected.image).startsWith("https://")}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-500">
                      <ImageIcon className="h-10 w-10" />
                      <p className="text-xs">Aucune image</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <CmsFormField label="Titre du projet">
                    <input
                      className={cmsInputClass}
                      value={String(selected.title ?? "")}
                      onChange={(e) =>
                        updateItem(selectedIndex, { title: e.target.value })
                      }
                    />
                  </CmsFormField>

                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                      Catégorie
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => {
                        const active =
                          String(selected.category) === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                              updateItem(selectedIndex, { category: cat.id })
                            }
                            className={cn(
                              "border px-3 py-1.5 text-xs font-medium transition-colors",
                              active
                                ? "border-ink bg-ink text-cream"
                                : "border-border bg-surface text-muted hover:border-gold/50"
                            )}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <CmsImageField
                    label="Image"
                    value={String(selected.image ?? "")}
                    onChange={(url) =>
                      updateItem(selectedIndex, {
                        image: url,
                        sources: [url],
                      })
                    }
                    hint="Cloudinary recommandé pour la production"
                  />
                </div>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}
