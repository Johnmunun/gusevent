import { AdminShell } from "@/components/admin/AdminShell";
import { TasksPageView } from "@/components/admin/production/TasksPageView";

export default function AdminTachesPage() {
  return (
    <AdminShell
      title="Tâches équipe"
      description="Actions à mener par dossier — mises à jour selon le statut des devis."
    >
      <TasksPageView />
    </AdminShell>
  );
}
