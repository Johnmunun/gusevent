import { AdminShell } from "@/components/admin/AdminShell";
import { TestimonialsAdminPageView } from "@/components/admin/testimonials/TestimonialsAdminPageView";

export default function AdminTestimonialsPage() {
  return (
    <AdminShell
      title="Témoignages clients"
      description="Invitations, validation et publication sur le site."
    >
      <TestimonialsAdminPageView />
    </AdminShell>
  );
}
