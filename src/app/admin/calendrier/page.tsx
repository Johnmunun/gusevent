import { AdminShell } from "@/components/admin/AdminShell";
import { CalendarPageView } from "@/components/admin/production/CalendarPageView";

export default function AdminCalendrierPage() {
  return (
    <AdminShell
      title="Calendrier"
      description="Dates d'événements issues des demandes de devis confirmées ou en préparation."
    >
      <CalendarPageView />
    </AdminShell>
  );
}
