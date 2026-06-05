"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DevisButton } from "@/components/ui/DevisButton";
import { Logo, type LogoBranding } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

type HeaderProps = {
  branding?: LogoBranding;
};

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Réalisations", href: "/#realisations" },
  { label: "Témoignages", href: "/#temoignages" },
  { label: "À propos", href: "/#apropos" },
  { label: "Devis", href: "/devis" },
];

export function Header({ branding }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [onHero, setOnHero] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setOnHero(y < window.innerHeight * 0.75);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lightNav = !onHero || scrolled;

  const linkClass = cn(
    "relative py-1 text-[0.8125rem] font-medium tracking-wide transition-colors duration-300",
    "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100",
    lightNav
      ? "text-muted hover:text-foreground"
      : "text-white/80 hover:text-white"
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/50 bg-cream/92 shadow-[0_1px_0_rgba(201,169,98,0.12),0_8px_24px_-8px_rgba(28,25,23,0.08)] backdrop-blur-xl"
          : onHero
            ? "bg-gradient-to-b from-ink/35 via-ink/10 to-transparent backdrop-blur-[2px]"
            : "border-b border-border/40 bg-cream/80 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-14 min-h-14 w-full max-w-[82rem] items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-12 xl:px-16">
        <Logo
          variant={lightNav ? "dark" : "light"}
          branding={branding}
        />

        <nav className="hidden md:block" aria-label="Navigation principale">
          <ul className="flex items-center gap-8 lg:gap-9">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <DevisButton size="md" />
        </div>

        <button
          type="button"
          className={cn(
            "rounded-lg p-2 transition-colors md:hidden",
            lightNav
              ? "text-foreground hover:bg-surface"
              : "text-white hover:bg-white/10"
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer" : "Menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/80 bg-cream/98 backdrop-blur-lg md:hidden"
          >
            <ul className="flex flex-col px-4 py-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-border/50 py-3.5 text-sm font-medium text-foreground transition-colors last:border-b-0 hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4 pb-1">
                <DevisButton size="md" className="w-full" />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
