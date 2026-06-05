import { AdminShell } from "@/components/admin/AdminShell";
import { ClientsPageView } from "@/components/admin/ClientsPageView";

export default function AdminClientsPage() {
  return (
    <AdminShell
      title="Clients"
      description="CRM — clients issus des demandes de devis, statuts synchronisés avec le pipeline."
    >
      <ClientsPageView />
    </AdminShell>
  );
}
