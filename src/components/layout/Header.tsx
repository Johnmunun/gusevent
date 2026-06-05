"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DevisButton } from "@/components/ui/DevisButton";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Réalisations", href: "/#realisations" },
  { label: "Témoignages", href: "/#temoignages" },
  { label: "À propos", href: "/#apropos" },
  { label: "Devis", href: "/devis" },
];

export function Header() {
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

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled && "border-b border-border/60 bg-cream/90 backdrop-blur-xl"
      )}
    >
      <div className="mx-auto flex h-14 min-h-14 w-full max-w-[82rem] items-center justify-between px-4 sm:h-[4.5rem] sm:px-6 lg:px-12 xl:px-16">
        <Logo variant={lightNav ? "dark" : "light"} showText />

        <ul className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm tracking-wide transition-colors",
                  lightNav
                    ? "text-muted hover:text-foreground"
                    : "text-white/75 hover:text-gold"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <DevisButton size="md" />
        </div>

        <button
          type="button"
          className={cn(
            "p-2 md:hidden",
            lightNav ? "text-foreground" : "text-white"
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer" : "Menu"}
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
            className="overflow-hidden border-t border-border bg-cream md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <DevisButton size="md" className="w-full" />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
