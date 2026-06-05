"use client";

import { Bell, LogOut, Menu, Search } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { useAdminApp } from "@/components/admin/admin-app-context";

type AdminTopbarProps = {
  title: string;
  description?: string;
  onMenuClick?: () => void;
};

export function AdminTopbar({
  title,
  description,
  onMenuClick,
}: AdminTopbarProps) {
  const appSession = useAdminApp();
  const initial = appSession?.user.name?.charAt(0) ?? "A";

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-cream/90 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-surface text-foreground lg:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-medium text-foreground sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative hidden min-w-[12rem] flex-1 sm:block md:min-w-[16rem]">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Rechercher client, événement…"
              className="w-full border border-border bg-surface py-2.5 pr-3 pl-10 text-sm outline-none placeholder:text-stone-400 focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
              disabled
              aria-label="Recherche"
            />
          </div>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center border border-border bg-surface text-muted hover:text-gold"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-gold" />
          </button>
          <div className="hidden items-center gap-3 border-l border-border pl-4 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center bg-ink font-display text-sm text-gold">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {appSession?.user.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-muted">
                {appSession?.user.role
                  ? ROLE_LABELS[appSession.user.role]
                  : "gusEvent Pro"}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = "/admin/login";
                    },
                  },
                })
              }
              className="flex h-10 w-10 items-center justify-center border border-border text-muted hover:text-gold"
              aria-label="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
