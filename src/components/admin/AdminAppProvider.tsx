"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import type { AppSession } from "@/lib/auth/app-session";
import { AdminAppContext } from "@/components/admin/admin-app-context";

type AdminAppProviderProps = {
  children: React.ReactNode;
};

export function AdminAppProvider({ children }: AdminAppProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: neonSession, isPending } = authClient.useSession();
  const [appSession, setAppSession] = useState<AppSession | null>(null);
  const [checking, setChecking] = useState(true);

  const isLogin = pathname === "/admin/login";
  const isUnauthorized = pathname === "/admin/unauthorized";

  useEffect(() => {
    if (isLogin || isUnauthorized) {
      setChecking(false);
      return;
    }

    if (isPending) return;

    if (!neonSession?.user) {
      router.replace(`/admin/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    let cancelled = false;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    fetch("/api/admin/me", { signal: controller.signal })
      .then(async (res) => {
        clearTimeout(timeout);
        if (cancelled) return;
        if (!res.ok) {
          router.replace("/admin/unauthorized");
          return;
        }
        const data = (await res.json()) as AppSession;
        setAppSession(data);
        setChecking(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        if (!cancelled) {
          router.replace(
            "/admin/login?error=db&callbackUrl=" + encodeURIComponent(pathname)
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isPending, neonSession, pathname, router, isLogin, isUnauthorized]);

  if (isLogin || isUnauthorized) {
    return <>{children}</>;
  }

  if (isPending || checking) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center text-sm text-muted">
        Vérification de l&apos;accès…
      </div>
    );
  }

  return (
    <AdminAppContext.Provider value={appSession}>{children}</AdminAppContext.Provider>
  );
}
