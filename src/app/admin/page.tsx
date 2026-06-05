import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="Tableau de bord"
      description="Vue stratégique de votre agence événementielle."
    >
      <AdminDashboard />
    </AdminShell>
  );
}
