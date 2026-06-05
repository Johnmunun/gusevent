import { AdminShell } from "@/components/admin/AdminShell";
import { CmsPageView } from "@/components/admin/cms/CmsPageView";

export default function AdminCmsPage() {
  return (
    <AdminShell
      title="CMS — Contenu du site"
      description="Textes et images de la page d'accueil — synchronisés avec la base."
    >
      <CmsPageView />
    </AdminShell>
  );
}
