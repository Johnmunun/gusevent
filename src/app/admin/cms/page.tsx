import Link from "next/link";
import { ArrowRight, Layout } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { CMS_SECTION_LABELS } from "@/lib/cms/defaults";
import { CMS_SLUGS } from "@/lib/cms/types";

export default function AdminCmsPage() {
  return (
    <AdminShell
      title="CMS — Contenu du site"
      description="Modifiez les textes et images de chaque section de la page d'accueil."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CMS_SLUGS.map((slug) => (
          <Link key={slug} href={`/admin/cms/${slug}`} className="group block">
            <AdminCard hover className="h-full transition-all group-hover:border-gold/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Layout className="mb-3 h-5 w-5 text-gold" />
                  <h3 className="font-display text-lg text-foreground">
                    {CMS_SECTION_LABELS[slug]}
                  </h3>
                  <p className="mt-1 text-xs text-muted">/{slug}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-gold" />
              </div>
            </AdminCard>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
