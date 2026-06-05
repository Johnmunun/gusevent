import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { Sparkles, Instagram, Mail, Share2 } from "lucide-react";

const channels = [
  {
    icon: Instagram,
    name: "Instagram",
    stat: "1,2 k abonnés",
    action: "Planifier un post",
  },
  {
    icon: Mail,
    name: "Newsletter",
    stat: "Liste : 340 contacts",
    action: "Créer une campagne",
  },
  {
    icon: Share2,
    name: "Réseaux",
    stat: "3 plateformes liées",
    action: "Voir les stats",
  },
];

export default function AdminMarketingPage() {
  return (
    <AdminShell
      title="Marketing"
      description="Visibilité, contenus et fidélisation — booster la notoriété gusEvent."
    >
      <div className="admin-welcome mb-8 flex items-start gap-4 px-6 py-6 text-cream">
        <Sparkles className="h-8 w-8 shrink-0 text-gold" />
        <div>
          <p className="font-display text-xl">Croissance & image de marque</p>
          <p className="mt-2 text-sm text-stone-400">
            Centralisez vos actions marketing pour attirer plus de demandes de
            devis qualifiées.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {channels.map((ch) => {
          const Icon = ch.icon;
          return (
            <AdminCard key={ch.name}>
              <Icon className="h-6 w-6 text-gold" strokeWidth={1.25} />
              <p className="mt-4 font-display text-lg text-foreground">
                {ch.name}
              </p>
              <p className="mt-1 text-sm text-muted">{ch.stat}</p>
              <button
                type="button"
                className="mt-4 w-full border border-gold/40 py-2 text-xs font-medium text-gold hover:bg-gold/10"
              >
                {ch.action}
              </button>
            </AdminCard>
          );
        })}
      </div>

      <AdminCard title="Idées de contenu" className="mt-6">
        <ul className="space-y-3 text-sm text-muted">
          <li>• Coulisses d&apos;un mariage récent (Reels)</li>
          <li>• Témoignage client vidéo — Karim Benali</li>
          <li>• Carousel « 5 surprises qui marquent »</li>
          <li>• Story sondage : quel événement rêvez-vous ?</li>
        </ul>
      </AdminCard>
    </AdminShell>
  );
}
