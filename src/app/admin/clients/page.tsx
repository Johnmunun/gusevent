import { AdminShell } from "@/components/admin/AdminShell";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { ClientsToolbar } from "@/components/admin/ClientsToolbar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { mockClients } from "@/data/admin-mock";

export default function AdminClientsPage() {
  const confirmed = mockClients.filter((c) => c.status === "confirme").length;

  return (
    <AdminShell
      title="Clients"
      description="CRM complet — historique, statuts et priorités."
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="Total clients"
          value={String(mockClients.length)}
          trend="up"
        />
        <AdminStatCard
          label="Confirmés"
          value={String(confirmed)}
          hint="Événements signés"
          trend="up"
        />
        <AdminStatCard
          label="Priorité haute"
          value={String(mockClients.filter((c) => c.priority === "haute").length)}
          trend="neutral"
        />
      </div>
      <ClientsToolbar />
      <ClientsTable />
    </AdminShell>
  );
}
