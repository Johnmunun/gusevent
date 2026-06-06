import { AdminShell } from "@/components/admin/AdminShell";
import { HrPageView } from "@/components/admin/hr/HrPageView";

export default function AdminHrPage() {
  return (
    <AdminShell
      title="RH — Employés"
      description="Gestion de l'équipe gusEvent : annuaire, paie, bulletins PDF et exports Excel."
    >
      <HrPageView />
    </AdminShell>
  );
}
