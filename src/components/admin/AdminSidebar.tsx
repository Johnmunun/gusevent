"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/config/brand";
import { adminFooterLink } from "@/config/admin-nav";
import { filterAdminNav } from "@/lib/auth/nav-filter";
import { useAdminApp } from "@/components/admin/admin-app-context";
import { cn } from "@/lib/utils";

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

  return (
    <aside
      className={cn(
        "flex h-screen min-h-screen w-[17.5rem] shrink-0 flex-col bg-ink text-cream",
        className
      )}
    >
      <div className="border-b border-white/10 bg-gradient-to-br from-ink to-stone-900 px-5 py-7">
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

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6 last:mb-0">
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] text-stone-500 uppercase">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.exact === true
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm transition-all",
                        active
                          ? "bg-gold/15 text-gold ring-1 ring-gold/25"
                          : "text-stone-400 hover:bg-white/5 hover:text-cream"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "min-w-[1.25rem] px-1.5 py-0.5 text-center text-[10px] font-bold",
                            active
                              ? "bg-gold text-ink"
                              : "bg-white/10 text-stone-300"
                          )}
                        >
                          {item.badge}
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

      <div className="mt-auto shrink-0 border-t border-white/10 bg-ink/90 p-4">
        <div className="mb-4 border border-gold/20 bg-gold/5 px-3 py-3">
          <p className="text-xs font-medium text-gold">Boost agence</p>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
            CRM, pipeline, calendrier et analytics — prêt à connecter.
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
