import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  EventTypeChart,
  LeadsChartAnimated,
  RevenueChartAnimated,
} from "@/components/admin/DashboardCharts";

export default function AdminAnalyticsPage() {
  return (
    <AdminShell
      title="Analytics"
      description="Performance commerciale et croissance de l'agence."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="CA mensuel"
          value="35"
          suffix=" k DT"
          hint="+22 %"
          trend="up"
        />
        <AdminStatCard
          label="Panier moyen"
          value="12 400"
          suffix=" DT"
          trend="up"
        />
        <AdminStatCard
          label="Leads / mois"
          value="18"
          hint="4 en attente"
          trend="up"
        />
        <AdminStatCard
          label="Marge estimée"
          value="38"
          suffix=" %"
          trend="neutral"
        />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RevenueChartAnimated />
        <LeadsChartAnimated />
      </div>
      <div className="mt-6">
        <EventTypeChart />
      </div>
    </AdminShell>
  );
}
