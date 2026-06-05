import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { QuoteRequestsList } from "@/components/admin/devis/QuoteRequestsList";

export default function AdminDevisPage() {
  return (
    <AdminShell
      title="Demandes de devis"
      description="Leads entrants depuis le formulaire public — enregistrés en base avec notifications."
    >
      <Suspense
        fallback={
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </p>
        }
      >
        <QuoteRequestsList />
      </Suspense>
    </AdminShell>
  );
}
