import { AdminShell } from "@/components/admin/AdminShell";
import { AccessPageView } from "@/components/admin/access/AccessPageView";

export default function AdminAccessPage() {
  return (
    <AdminShell
      title="Rôles & accès"
      description="Matrice des permissions par rôle — synchronisée avec les comptes actifs."
    >
      <AccessPageView />
    </AdminShell>
  );
}
