"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { useDevisDrawer } from "@/components/devis/DevisDrawerProvider";
import { contact, telLink } from "@/config/contact";

export function MobileStickyCTA() {
  const { open } = useDevisDrawer();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-cream/95 p-3 backdrop-blur-lg md:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        <Link
          href={telLink}
          className="flex flex-1 items-center justify-center gap-2 border border-border bg-surface py-3 text-sm font-medium text-foreground"
        >
          <Phone className="h-4 w-4 text-gold" />
          Appeler
        </Link>
        <button
          type="button"
          onClick={open}
          className="devis-cta-mobile flex flex-[1.2] items-center justify-center bg-ink py-3 text-sm font-medium text-cream"
        >
          Devis gratuit
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-muted">
        Réponse sous 24 h · {contact.phoneDisplay}
      </p>
    </div>
  );
}
