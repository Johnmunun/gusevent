"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/config/brand";
import { adminFooterLink, type AdminNavItem } from "@/config/admin-nav";
import { filterAdminNav } from "@/lib/auth/nav-filter";
import { useAdminApp } from "@/components/admin/admin-app-context";
import { cn } from "@/lib/utils";

const NAV_STATS_POLL_MS = 10000;

type NavStats = {
  clients: number;
  pendingQuotes: number;
  pipeline: number;
  tasks: number;
};

const EMPTY_STATS: NavStats = {
  clients: 0,
  pendingQuotes: 0,
  pipeline: 0,
  tasks: 0,
};

type AdminSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname();
  const appSession = useAdminApp();
  const navGroups = appSession?.user
    ? filterAdminNav(appSession.user.role, appSession.user.permissions)
    : [];
  const [stats, setStats] = useState<NavStats>(EMPTY_STATS);

  const hasDynamicBadges = navGroups.some((group) =>
    group.items.some((item) => item.dynamicBadge)
  );

  useEffect(() => {
    if (!hasDynamicBadges) return;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/nav-stats", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const data = (await res.json()) as NavStats;
        setStats({
          clients: data.clients ?? 0,
          pendingQuotes: data.pendingQuotes ?? 0,
          pipeline: data.pipeline ?? 0,
          tasks: data.tasks ?? 0,
        });
      } catch {
        /* silencieux */
      }
    };

    fetchStats();
    const interval = window.setInterval(fetchStats, NAV_STATS_POLL_MS);
    return () => window.clearInterval(interval);
  }, [hasDynamicBadges]);

  function formatBadgeCount(value: number): string {
    return value > 99 ? "99+" : String(value);
  }

  function resolveBadge(item: AdminNavItem): string | null {
    if (!item.dynamicBadge) return item.badge ?? null;

    const value = stats[item.dynamicBadge];
    if (value <= 0) return null;

    if (item.dynamicBadge === "clients") {
      return formatBadgeCount(value);
    }

    return formatBadgeCount(value);
  }

  const summaryParts: string[] = [];
  if (stats.clients > 0) {
    summaryParts.push(
      `${stats.clients} client${stats.clients > 1 ? "s" : ""}`
    );
  }
  if (stats.pendingQuotes > 0) {
    summaryParts.push(
      `${stats.pendingQuotes} devis à traiter`
    );
  }
  if (stats.pipeline > 0 && stats.pendingQuotes === 0) {
    summaryParts.push(`${stats.pipeline} en pipeline`);
  }

  return (
    <aside
      className={cn(
        "flex h-dvh w-[var(--admin-sidebar-width)] shrink-0 flex-col bg-ink text-cream",
        className
      )}
    >
      <div className="border-b border-white/10 bg-gradient-to-br from-ink to-stone-900 px-6 py-8">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="block font-display text-2xl font-medium tracking-tight"
        >
          {brand.name}
        </Link>
        <p className="mt-2 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Espace Pro
        </p>
      </div>

      <nav className="admin-sidebar-nav min-h-0 flex-1 overflow-y-auto px-4 py-6">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6 last:mb-0">
            <p className="mb-3 px-3 text-[11px] font-semibold tracking-[0.18em] text-stone-500 uppercase">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.exact === true
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                const badge = resolveBadge(item);
                const isPendingBadge =
                  item.dynamicBadge === "pendingQuotes" && stats.pendingQuotes > 0;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3.5 px-4 py-3 text-[0.9375rem] transition-all",
                        active
                          ? "bg-gold/15 text-gold ring-1 ring-gold/25"
                          : "text-stone-400 hover:bg-white/5 hover:text-cream"
                      )}
                    >
                      <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={1.5} />
                      <span className="flex-1">{item.label}</span>
                      {badge && (
                        <span
                          className={cn(
                            "min-w-[1.25rem] px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums",
                            isPendingBadge && "sidebar-badge-pending",
                            active
                              ? "bg-gold text-ink"
                              : isPendingBadge
                                ? "bg-gold/90 text-ink"
                                : "bg-white/10 text-stone-300"
                          )}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto shrink-0 border-t border-white/10 bg-ink/90 p-5">
        <div className="mb-4 border border-gold/20 bg-gold/5 px-3 py-3">
          <p className="text-xs font-medium text-gold">Activité en direct</p>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
            {summaryParts.length > 0
              ? summaryParts.join(" · ")
              : "Aucune activité en attente pour le moment."}
          </p>
        </div>
        <Link
          href={adminFooterLink.href}
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-gold"
        >
          <adminFooterLink.icon className="h-4 w-4" />
          {adminFooterLink.label}
        </Link>
      </div>
    </aside>
  );
}
