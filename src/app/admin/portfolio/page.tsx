import { AdminShell } from "@/components/admin/AdminShell";
import { galleryItems } from "@/data/landing";
import Image from "next/image";

export default function AdminPortfolioPage() {
  return (
    <AdminShell
      title="Portfolio"
      description="Gérez les visuels affichés sur la landing (réalisations)."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="bg-gold px-5 py-2.5 text-sm font-medium text-ink"
        >
          + Ajouter une photo
        </button>
        <button
          type="button"
          className="border border-border px-5 py-2.5 text-sm font-medium"
        >
          Synchroniser médias
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {galleryItems.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden border border-border bg-surface"
          >
            <div className="relative aspect-[4/3] bg-ink">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="280px"
                unoptimized
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted capitalize">{item.category}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        Fichiers dans public/media/ — {galleryItems.length} visuels actifs sur le
        site.
      </p>
    </AdminShell>
  );
}
