import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyticsPageView } from "@/components/admin/AnalyticsPageView";

export default function AdminAnalyticsPage() {
  return (
    <AdminShell
      title="Analytics"
      description="Performance commerciale et croissance de l'agence."
    >
      <AnalyticsPageView />
    </AdminShell>
  );
}
