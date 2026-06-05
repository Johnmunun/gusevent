"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { CmsImageField } from "@/components/admin/cms/CmsImageField";
import {
  CmsFormField,
  cmsInputClass,
  cmsTextareaClass,
} from "@/components/admin/cms/CmsFormField";
import { SERVICE_ICON_OPTIONS } from "@/lib/cms/service-icons";
import { CMS_SECTION_LABELS } from "@/lib/cms/defaults";
import type { CmsSlug } from "@/lib/cms/types";

type CmsSectionEditorProps = {
  slug: CmsSlug;
};

export function CmsSectionEditor({ slug }: CmsSectionEditorProps) {
  const [content, setContent] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/cms/${slug}`)
      .then((r) => r.json())
      .then((data) => setContent(data.content))
      .finally(() => setLoading(false));
  }, [slug]);

  async function save() {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/cms/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    setMessage(res.ok ? "Enregistré." : "Erreur lors de l'enregistrement.");
  }

  if (loading || content === null) {
    return (
      <div className="flex items-center gap-2 py-20 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-foreground">{CMS_SECTION_LABELS[slug]}</h2>
          <p className="mt-1 text-sm text-muted">Modifications visibles sur le site public.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-stone-800 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </button>
      </div>

      {message && (
        <p className="border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-foreground">
          {message}
        </p>
      )}

      {slug === "hero" && (
        <HeroEditor content={content as Record<string, unknown>} setContent={setContent} />
      )}
      {slug === "stats" && (
        <StatsEditor content={content as Array<Record<string, unknown>>} setContent={setContent} />
      )}
      {slug === "services" && (
        <ServicesEditor content={content as Record<string, unknown>} setContent={setContent} />
      )}
      {slug === "gallery" && (
        <GalleryEditor content={content as Record<string, unknown>} setContent={setContent} />
      )}
      {slug === "testimonials" && (
        <TestimonialsEditor content={content as Record<string, unknown>} setContent={setContent} />
      )}
      {slug === "about" && (
        <AboutEditor content={content as Record<string, unknown>} setContent={setContent} />
      )}
      {slug === "cta" && (
        <CtaEditor content={content as Record<string, unknown>} setContent={setContent} />
      )}
      {slug === "footer" && (
        <FooterEditor content={content as Record<string, unknown>} setContent={setContent} />
      )}
    </div>
  );
}

function HeroEditor({
  content,
  setContent,
}: {
  content: Record<string, unknown>;
  setContent: (c: unknown) => void;
}) {
  const set = (key: string, value: string) =>
    setContent({ ...content, [key]: value });

  return (
    <div className="admin-card space-y-5 bg-surface p-6">
      <CmsFormField label="Surtitre">
        <input className={cmsInputClass} value={String(content.eyebrow ?? "")} onChange={(e) => set("eyebrow", e.target.value)} />
      </CmsFormField>
      <CmsFormField label="Titre (avant surligné)">
        <input className={cmsInputClass} value={String(content.titleBefore ?? "")} onChange={(e) => set("titleBefore", e.target.value)} />
      </CmsFormField>
      <CmsFormField label="Mot surligné">
        <input className={cmsInputClass} value={String(content.titleHighlight ?? "")} onChange={(e) => set("titleHighlight", e.target.value)} />
      </CmsFormField>
      <CmsFormField label="Titre (après surligné)">
        <input className={cmsInputClass} value={String(content.titleAfter ?? "")} onChange={(e) => set("titleAfter", e.target.value)} />
      </CmsFormField>
      <CmsFormField label="Sous-titre">
        <textarea className={cmsTextareaClass} value={String(content.subtitle ?? "")} onChange={(e) => set("subtitle", e.target.value)} />
      </CmsFormField>
      <CmsFormField label="Bouton secondaire — libellé">
        <input className={cmsInputClass} value={String(content.ctaSecondaryLabel ?? "")} onChange={(e) => set("ctaSecondaryLabel", e.target.value)} />
      </CmsFormField>
      <CmsFormField label="Bouton secondaire — lien">
        <input className={cmsInputClass} value={String(content.ctaSecondaryHref ?? "")} onChange={(e) => set("ctaSecondaryHref", e.target.value)} />
      </CmsFormField>
      <CmsImageField
        label="Image de fond"
        value={String(content.backgroundImage ?? "")}
        onChange={(url) => set("backgroundImage", url)}
      />
    </div>
  );
}

function StatsEditor({
  content,
  setContent,
}: {
  content: Array<Record<string, unknown>>;
  setContent: (c: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      {content.map((stat, i) => (
        <div key={i} className="admin-card grid gap-4 bg-surface p-5 sm:grid-cols-2">
          <CmsFormField label="Libellé">
            <input
              className={cmsInputClass}
              value={String(stat.label ?? "")}
              onChange={(e) => {
                const next = [...content];
                next[i] = { ...stat, label: e.target.value };
                setContent(next);
              }}
            />
          </CmsFormField>
          <CmsFormField label="Valeur">
            <input
              type="number"
              className={cmsInputClass}
              value={Number(stat.value ?? 0)}
              onChange={(e) => {
                const next = [...content];
                next[i] = { ...stat, value: Number(e.target.value) };
                setContent(next);
              }}
            />
          </CmsFormField>
          <CmsFormField label="Suffixe (+, %, …)">
            <input
              className={cmsInputClass}
              value={String(stat.suffix ?? "")}
              onChange={(e) => {
                const next = [...content];
                next[i] = { ...stat, suffix: e.target.value };
                setContent(next);
              }}
            />
          </CmsFormField>
        </div>
      ))}
    </div>
  );
}

function HeadingFields({
  heading,
  onChange,
}: {
  heading: Record<string, string>;
  onChange: (h: Record<string, string>) => void;
}) {
  return (
    <div className="grid gap-4 border-b border-border pb-6 sm:grid-cols-1">
      <CmsFormField label="Surtitre section">
        <input className={cmsInputClass} value={heading.eyebrow ?? ""} onChange={(e) => onChange({ ...heading, eyebrow: e.target.value })} />
      </CmsFormField>
      <CmsFormField label="Titre section">
        <input className={cmsInputClass} value={heading.title ?? ""} onChange={(e) => onChange({ ...heading, title: e.target.value })} />
      </CmsFormField>
      <CmsFormField label="Description section">
        <textarea className={cmsTextareaClass} value={heading.description ?? ""} onChange={(e) => onChange({ ...heading, description: e.target.value })} />
      </CmsFormField>
    </div>
  );
}

function ServicesEditor({
  content,
  setContent,
}: {
  content: Record<string, unknown>;
  setContent: (c: unknown) => void;
}) {
  const heading = (content.heading ?? {}) as Record<string, string>;
  const items = (content.items ?? []) as Array<Record<string, string>>;

  return (
    <div className="admin-card space-y-6 bg-surface p-6">
      <HeadingFields
        heading={heading}
        onChange={(h) => setContent({ ...content, heading: h })}
      />
      {items.map((item, i) => (
        <div key={i} className="space-y-3 border-t border-border pt-5">
          <p className="text-sm font-medium">Service {i + 1}</p>
          <CmsFormField label="Titre">
            <input
              className={cmsInputClass}
              value={item.title ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, title: e.target.value };
                setContent({ ...content, items: next });
              }}
            />
          </CmsFormField>
          <CmsFormField label="Description">
            <textarea
              className={cmsTextareaClass}
              value={item.description ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, description: e.target.value };
                setContent({ ...content, items: next });
              }}
            />
          </CmsFormField>
          <CmsFormField label="Icône">
            <select
              className={cmsInputClass}
              value={item.iconKey ?? "Heart"}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, iconKey: e.target.value };
                setContent({ ...content, items: next });
              }}
            >
              {SERVICE_ICON_OPTIONS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </CmsFormField>
        </div>
      ))}
    </div>
  );
}

function GalleryEditor({
  content,
  setContent,
}: {
  content: Record<string, unknown>;
  setContent: (c: unknown) => void;
}) {
  const heading = (content.heading ?? {}) as Record<string, string>;
  const items = (content.items ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="admin-card space-y-6 bg-surface p-6">
      <HeadingFields heading={heading} onChange={(h) => setContent({ ...content, heading: h })} />
      {items.map((item, i) => (
        <div key={String(item.id ?? i)} className="space-y-3 border-t border-border pt-5">
          <p className="text-sm font-medium">Projet {i + 1}</p>
          <CmsFormField label="Titre">
            <input
              className={cmsInputClass}
              value={String(item.title ?? "")}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, title: e.target.value };
                setContent({ ...content, items: next });
              }}
            />
          </CmsFormField>
          <CmsImageField
            label="Image"
            value={String(item.image ?? "")}
            onChange={(url) => {
              const next = [...items];
              next[i] = { ...item, image: url };
              setContent({ ...content, items: next });
            }}
          />
        </div>
      ))}
    </div>
  );
}

function TestimonialsEditor({
  content,
  setContent,
}: {
  content: Record<string, unknown>;
  setContent: (c: unknown) => void;
}) {
  const heading = (content.heading ?? {}) as Record<string, string>;
  const items = (content.items ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="admin-card space-y-6 bg-surface p-6">
      <HeadingFields heading={heading} onChange={(h) => setContent({ ...content, heading: h })} />
      {items.map((item, i) => (
        <div key={String(item.id ?? i)} className="space-y-3 border-t border-border pt-5">
          <p className="text-sm font-medium">Témoignage {i + 1}</p>
          {(["name", "role", "company"] as const).map((field) => (
            <CmsFormField key={field} label={field}>
              <input
                className={cmsInputClass}
                value={String(item[field] ?? "")}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...item, [field]: e.target.value };
                  setContent({ ...content, items: next });
                }}
              />
            </CmsFormField>
          ))}
          <CmsFormField label="Citation">
            <textarea
              className={cmsTextareaClass}
              value={String(item.quote ?? "")}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, quote: e.target.value };
                setContent({ ...content, items: next });
              }}
            />
          </CmsFormField>
          <CmsImageField
            label="Photo"
            value={String(item.image ?? "")}
            onChange={(url) => {
              const next = [...items];
              next[i] = { ...item, image: url };
              setContent({ ...content, items: next });
            }}
          />
        </div>
      ))}
    </div>
  );
}

function AboutEditor({
  content,
  setContent,
}: {
  content: Record<string, unknown>;
  setContent: (c: unknown) => void;
}) {
  const heading = (content.heading ?? {}) as Record<string, string>;
  const slides = (content.slides ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="admin-card space-y-6 bg-surface p-6">
      <HeadingFields heading={heading} onChange={(h) => setContent({ ...content, heading: h })} />
      {slides.map((slide, i) => (
        <div key={String(slide.id ?? i)} className="space-y-3 border-t border-border pt-5">
          <p className="text-sm font-medium">{String(slide.tab ?? `Onglet ${i + 1}`)}</p>
          <CmsFormField label="Titre">
            <input
              className={cmsInputClass}
              value={String(slide.title ?? "")}
              onChange={(e) => {
                const next = [...slides];
                next[i] = { ...slide, title: e.target.value };
                setContent({ ...content, slides: next });
              }}
            />
          </CmsFormField>
          {slide.type === "prose" && (
            <CmsFormField label="Texte">
              <textarea
                className={cmsTextareaClass}
                value={String(slide.body ?? "")}
                onChange={(e) => {
                  const next = [...slides];
                  next[i] = { ...slide, body: e.target.value };
                  setContent({ ...content, slides: next });
                }}
              />
            </CmsFormField>
          )}
        </div>
      ))}
    </div>
  );
}

function CtaEditor({
  content,
  setContent,
}: {
  content: Record<string, unknown>;
  setContent: (c: unknown) => void;
}) {
  const set = (key: string, value: string) =>
    setContent({ ...content, [key]: value });

  return (
    <div className="admin-card space-y-5 bg-surface p-6">
      {(["eyebrow", "title", "description", "phoneLabel", "emailLabel"] as const).map((key) => (
        <CmsFormField key={key} label={key}>
          {key === "description" ? (
            <textarea className={cmsTextareaClass} value={String(content[key] ?? "")} onChange={(e) => set(key, e.target.value)} />
          ) : (
            <input className={cmsInputClass} value={String(content[key] ?? "")} onChange={(e) => set(key, e.target.value)} />
          )}
        </CmsFormField>
      ))}
    </div>
  );
}

function FooterEditor({
  content,
  setContent,
}: {
  content: Record<string, unknown>;
  setContent: (c: unknown) => void;
}) {
  const set = (key: string, value: string) =>
    setContent({ ...content, [key]: value });

  return (
    <div className="admin-card space-y-5 bg-surface p-6">
      <CmsFormField label="Accroche">
        <textarea className={cmsTextareaClass} value={String(content.tagline ?? "")} onChange={(e) => set("tagline", e.target.value)} />
      </CmsFormField>
      <p className="text-xs text-muted">
        Les liens du pied de page se modifient dans le JSON via l&apos;API pour l&apos;instant — contactez un développeur pour une extension complète des liens.
      </p>
    </div>
  );
}
