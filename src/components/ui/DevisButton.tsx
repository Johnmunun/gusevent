"use client";

import { ArrowRight } from "lucide-react";
import { useDevisDrawer } from "@/components/devis/DevisDrawerProvider";
import { cn } from "@/lib/utils";

type DevisButtonProps = {
  variant?: "gold" | "primary";
  size?: "md" | "lg";
  className?: string;
  wrapClassName?: string;
  children?: React.ReactNode;
  /** Ouvre la page /devis au lieu du drawer */
  usePage?: boolean;
};

const variantClass = {
  gold: "bg-gold text-ink hover:bg-gold-dark",
  primary: "bg-ink text-cream hover:bg-stone-800",
};

const sizeClass = {
  md: "px-6 py-2.5 text-sm tracking-wide",
  lg: "px-8 py-3.5 text-sm tracking-wide",
};

export function DevisButton({
  variant = "gold",
  size = "lg",
  className,
  wrapClassName,
  children,
  usePage = false,
}: DevisButtonProps) {
  const { open } = useDevisDrawer();

  const inner = (
    <>
      {children ?? (
        <>
          Demander un devis
          <ArrowRight className="h-4 w-4 shrink-0" />
        </>
      )}
    </>
  );

  const btnClass = cn(
    "devis-cta-inner relative z-[1] inline-flex items-center justify-center gap-2 font-medium transition-all duration-300",
    variantClass[variant],
    sizeClass[size],
    className
  );

  return (
    <span
      className={cn(
        "devis-cta-wrap relative inline-flex min-w-0 max-w-full",
        wrapClassName
      )}
    >
      <span className="devis-cta-ring" aria-hidden />
      {usePage ? (
        <a href="/devis" className={btnClass}>
          {inner}
        </a>
      ) : (
        <button type="button" onClick={open} className={btnClass}>
          {inner}
        </button>
      )}
    </span>
  );
}
