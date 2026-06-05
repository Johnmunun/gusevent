import { AdminShell } from "@/components/admin/AdminShell";
import { PortfolioPageView } from "@/components/admin/portfolio/PortfolioPageView";

export default function AdminPortfolioPage() {
  return (
    <AdminShell
      title="Portfolio"
      description="Visuels de la landing — issus de la section Galerie du CMS."
    >
      <PortfolioPageView />
    </AdminShell>
  );
}
