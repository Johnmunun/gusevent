"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FolderOpen,
  ImageIcon,
  Loader2,
  Pencil,
  X,
  ZoomIn,
} from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { ADMIN_CARD_ICONS } from "@/lib/admin/card-icons";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { cloudinaryPreviewUrl, isCloudinaryUrl } from "@/lib/cloudinary/utils";
import type { PortfolioData, PortfolioItem } from "@/lib/site/service";
import type { GalleryCategory } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

function thumbSrc(url: string) {
  return isCloudinaryUrl(url) ? cloudinaryPreviewUrl(url) : url;
}

type LightboxProps = {
  item: PortfolioItem;
  index: number;
  total: number;
  categoryLabel: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

function PortfolioLightbox({
  item,
  index,
  total,
  categoryLabel,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNext, onPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center border border-stone-600 text-cream hover:border-gold hover:text-gold"
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-stone-600 text-cream hover:border-gold"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-stone-600 text-cream hover:border-gold"
            aria-label="Photo suivante"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden border border-stone-700 bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative min-h-[50vh] flex-1 bg-ink">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
            unoptimized={!item.image.startsWith("https://")}
            priority
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <div>
            <p className="font-display text-lg text-foreground">{item.title}</p>
            <p className="mt-0.5 text-sm text-muted">
              {categoryLabel} · {index + 1} / {total}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={item.image}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-medium hover:border-gold hover:text-gold"
            >
              Ouvrir l&apos;original
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/admin/cms/gallery"
              className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-xs font-medium text-cream hover:bg-stone-800"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modifier
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PortfolioPageView() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/site/portfolio", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then((json: PortfolioData) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  const categoryLabel = useCallback(
    (id: string) => data?.filters.find((f) => f.id === id)?.label ?? id,
    [data?.filters]
  );

  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.items;
    return data.items.filter((item) => item.category === filter);
  }, [data, filter]);

  const openLightbox = (index: number) => setLightboxIndex(index);

  const closeLightbox = () => setLightboxIndex(null);

  const goLightbox = (delta: number) => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex(
      (lightboxIndex + delta + filteredItems.length) % filteredItems.length
    );
  };

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-12 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement du portfolio…
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted">Impossible de charger le portfolio.</p>
    );
  }

  const lightboxItem =
    lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <>
      <div className="admin-welcome mb-8 flex flex-wrap items-center justify-between gap-4 px-5 py-5 text-cream sm:px-6">
        <div className="flex items-start gap-3">
          <ImageIcon className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
          <div>
            <p className="font-display text-xl">{data.heading.title}</p>
            <p className="mt-2 text-sm text-stone-400">
              {data.stats.total} visuel{data.stats.total > 1 ? "s" : ""} ·
              cliquez sur une photo pour l&apos;agrandir.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/#realisations"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-stone-600 px-3 py-2 text-xs text-stone-300 hover:border-gold/40 hover:text-gold"
          >
            <Eye className="h-3.5 w-3.5" />
            Voir sur le site
          </Link>
          <Link
            href="/admin/cms/gallery"
            className="inline-flex items-center gap-2 border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
            Modifier la galerie
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Projets"
          value={String(data.stats.total)}
          hint="Affichés sur la landing"
          trend={data.stats.total > 0 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="Cloudinary"
          value={String(data.stats.cloudinary)}
          hint={
            data.storage.provider === "cloudinary"
              ? `Actif · ${data.storage.cloudinaryFolder}`
              : "Non configuré"
          }
          trend={data.stats.cloudinary > 0 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="Médias locaux"
          value={String(data.stats.localMedia)}
          hint="Chemins /media/…"
          trend="neutral"
        />
        <AdminStatCard
          label="Catégories"
          value={String(Object.keys(data.stats.byCategory).length)}
          hint="Filtres actifs"
          trend="neutral"
        />
      </div>

      {data.items.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {data.filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id as GalleryCategory);
                setLightboxIndex(null);
              }}
              className={cn(
                "border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.id
                  ? "border-ink bg-ink text-cream"
                  : "border-border bg-surface text-muted hover:border-gold/50"
              )}
            >
              {f.label}
              {f.id !== "all" && data.stats.byCategory[f.id]
                ? ` (${data.stats.byCategory[f.id]})`
                : f.id === "all"
                  ? ` (${data.stats.total})`
                  : ""}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <AdminCard>
          <p className="py-12 text-center text-sm text-muted">
            {data.items.length === 0 ? (
              <>
                Aucun visuel. Ajoutez des projets dans{" "}
                <Link
                  href="/admin/cms/gallery"
                  className="text-gold hover:underline"
                >
                  CMS → Galerie
                </Link>
                .
              </>
            ) : (
              "Aucun projet dans cette catégorie."
            )}
          </p>
        </AdminCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openLightbox(index)}
              className="group relative overflow-hidden border border-border bg-surface text-left shadow-sm transition-all hover:border-gold/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              <div
                className={cn(
                  "relative bg-ink",
                  item.span === "tall"
                    ? "aspect-[3/4]"
                    : item.span === "wide"
                      ? "aspect-[16/9]"
                      : "aspect-[4/3]"
                )}
              >
                <Image
                  src={thumbSrc(item.image)}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 280px"
                  unoptimized={!item.image.startsWith("https://")}
                />
                <div className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex h-11 w-11 items-center justify-center border border-cream/30 bg-ink/50 text-cream backdrop-blur-sm">
                    <ZoomIn className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium tracking-wide text-cream uppercase">
                    Voir la photo
                  </span>
                </div>
                <span className="absolute top-2 left-2 bg-ink/70 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-gold uppercase backdrop-blur-sm">
                  {categoryLabel(item.category)}
                </span>
              </div>
              <div className="border-t border-border/80 p-4">
                <p className="font-display text-base text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <ZoomIn className="h-3 w-3" />
                  Cliquer pour agrandir
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <AdminCard title="Stockage des images" icon={ADMIN_CARD_ICONS.storage} className="mt-8" hover={false}>
        <div className="flex items-start gap-3">
          <FolderOpen className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div className="space-y-2 text-sm text-muted">
            <p>{data.storage.note}</p>
            <p className="text-xs">
              <strong className="text-foreground">Upload :</strong>{" "}
              <code>{data.storage.cmsUploadPath}</code>
            </p>
          </div>
        </div>
      </AdminCard>

      <AnimatePresence>
        {lightboxItem && lightboxIndex !== null && (
          <PortfolioLightbox
            item={lightboxItem}
            index={lightboxIndex}
            total={filteredItems.length}
            categoryLabel={categoryLabel(lightboxItem.category)}
            onClose={closeLightbox}
            onPrev={() => goLightbox(-1)}
            onNext={() => goLightbox(1)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
