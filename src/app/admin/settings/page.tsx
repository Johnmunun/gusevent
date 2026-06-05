import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsPageView } from "@/components/admin/settings/SettingsPageView";

export default function AdminSettingsPage() {
  return (
    <AdminShell
      title="Paramètres"
      description="Logo, identité, emails, sécurité et état du système."
    >
      <SettingsPageView />
    </AdminShell>
  );
}
