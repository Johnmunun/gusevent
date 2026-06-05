import Link from "next/link";
import { CheckCircle2, Mail, Phone } from "lucide-react";
import { brand } from "@/config/brand";
import { contact, mailtoDevis, telLink } from "@/config/contact";

const steps = [
  {
    step: "01",
    title: "Votre demande",
    text: "Décrivez votre projet via le formulaire — nous analysons chaque détail.",
  },
  {
    step: "02",
    title: "Échange personnalisé",
    text: "Réponse sous 24 h pour affiner vos attentes et votre budget.",
  },
  {
    step: "03",
    title: "Proposition sur mesure",
    text: "Devis détaillé, créatif et transparent, adapté à votre vision.",
  },
  {
    step: "04",
    title: "Réalisation",
    text: "Coordination complète jusqu'au jour J, en toute sérénité.",
  },
] as const;

export function DevisSidebar() {
  return (
    <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
      <div className="border border-border bg-ink p-8 text-cream">
        <p className="label-upper text-gold">Processus</p>
        <h2 className="mt-4 font-display text-2xl font-medium">
          Comment ça se passe ?
        </h2>
        <ol className="mt-8 space-y-6">
          {steps.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="font-display text-lg text-gold/50">
                {item.step}
              </span>
              <div>
                <p className="font-medium text-cream">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-400">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="border border-border bg-surface p-8">
        <p className="label-upper">Contact direct</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Une question avant de remplir le formulaire ? L&apos;équipe{" "}
          {brand.name} est à votre écoute.
        </p>
        <ul className="mt-6 space-y-4">
          <li>
            <a
              href={telLink}
              className="flex items-center gap-3 text-foreground transition-colors hover:text-gold"
            >
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <span className="text-sm font-medium">{contact.phoneDisplay}</span>
            </a>
          </li>
          <li>
            <a
              href={mailtoDevis}
              className="flex items-start gap-3 break-all text-foreground transition-colors hover:text-gold"
            >
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <span className="text-sm font-medium">{contact.email}</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="flex items-start gap-3 border border-gold/30 bg-accent-light/40 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-medium text-foreground">Devis gratuit</span>{" "}
          et sans engagement. Vos informations restent confidentielles.
        </p>
      </div>

      <Link
        href="/#realisations"
        className="text-center text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
      >
        Voir nos réalisations
      </Link>
    </aside>
  );
}
