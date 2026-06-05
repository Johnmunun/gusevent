import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsSectionEditor } from "@/components/admin/cms/CmsSectionEditor";
import { CMS_SECTION_LABELS } from "@/lib/cms/defaults";
import { CMS_SLUGS, type CmsSlug } from "@/lib/cms/types";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminCmsSectionPage({ params }: Props) {
  const { slug } = await params;
  if (!(CMS_SLUGS as readonly string[]).includes(slug)) {
    notFound();
  }

  const sectionSlug = slug as CmsSlug;

  const description =
    sectionSlug === "gallery"
      ? "Gérez les visuels de la section Réalisations sur la page d'accueil."
      : "Éditeur de contenu pour la landing page.";

  return (
    <AdminShell
      title={CMS_SECTION_LABELS[sectionSlug]}
      description={description}
    >
      <Link
        href="/admin/cms"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-gold"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour au CMS
      </Link>
      <CmsSectionEditor slug={sectionSlug} />
    </AdminShell>
  );
}
