"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
};

const sizes = {
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-2xl",
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  size = "lg",
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-ink/55 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className={cn(
              "fixed inset-y-0 right-0 z-[101] flex w-full flex-col bg-cream shadow-2xl",
              sizes[size]
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-ink px-5 py-5 text-cream sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
                  gusEvent
                </p>
                <h2
                  id="drawer-title"
                  className="mt-1 font-display text-xl font-medium sm:text-2xl"
                >
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-stone-400">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 text-cream transition-colors hover:border-gold hover:text-gold"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
