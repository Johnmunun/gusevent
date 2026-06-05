import { AdminShell } from "@/components/admin/AdminShell";
import { UsersManager } from "@/components/admin/users/UsersManager";

export default function AdminUsersPage() {
  return (
    <AdminShell
      title="Utilisateurs"
      description="Créez et gérez les comptes qui accèdent au panneau d'administration."
    >
      <UsersManager />
    </AdminShell>
  );
}
