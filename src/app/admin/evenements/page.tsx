import { AdminShell } from "@/components/admin/AdminShell";
import { EventsPageView } from "@/components/admin/production/EventsPageView";

export default function AdminEvenementsPage() {
  return (
    <AdminShell
      title="Événements"
      description="Prestations en cours — synchronisées avec le pipeline commercial."
    >
      <EventsPageView />
    </AdminShell>
  );
}
