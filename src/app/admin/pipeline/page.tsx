import { AdminShell } from "@/components/admin/AdminShell";
import { PipelineBoard } from "@/components/admin/PipelineBoard";

export default function AdminPipelinePage() {
  return (
    <AdminShell
      title="Pipeline ventes"
      description="Suivez chaque demande de devis du premier contact à l'événement terminé."
    >
      <PipelineBoard />
    </AdminShell>
  );
}
