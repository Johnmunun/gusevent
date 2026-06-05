"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { QuoteForm } from "@/components/devis/QuoteForm";

type DevisDrawerContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const DevisDrawerContext = createContext<DevisDrawerContextValue | null>(null);

export function useDevisDrawer() {
  const ctx = useContext(DevisDrawerContext);
  if (!ctx) {
    throw new Error("useDevisDrawer must be used within DevisDrawerProvider");
  }
  return ctx;
}

export function DevisDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <DevisDrawerContext.Provider value={{ open, close, isOpen }}>
      {children}
      <Drawer
        open={isOpen}
        onClose={close}
        title="Demandez votre devis"
        description="Réponse sous 24 h — proposition personnalisée pour votre événement."
        size="xl"
      >
        <QuoteForm variant="drawer" onSubmitted={close} />
      </Drawer>
    </DevisDrawerContext.Provider>
  );
}
