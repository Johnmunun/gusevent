import { AdminShell } from "@/components/admin/AdminShell";
import { MarketingPageView } from "@/components/admin/MarketingPageView";

export default function AdminMarketingPage() {
  return (
    <AdminShell
      title="Marketing"
      description="Visibilité, contenus et fidélisation — booster la notoriété gusEvent."
    >
      <MarketingPageView />
    </AdminShell>
  );
}
