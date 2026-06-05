"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import type { AppSession } from "@/lib/auth/app-session";
import { AdminAppContext } from "@/components/admin/admin-app-context";

const ME_TIMEOUT_MS = 30000;

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
    let timedOut = false;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, ME_TIMEOUT_MS);

    fetch("/api/admin/me", { signal: controller.signal })
      .then(async (res) => {
        clearTimeout(timeout);
        if (cancelled) return;

        if (res.status === 401) {
          router.replace("/admin/unauthorized");
          return;
        }

        if (!res.ok) {
          router.replace(
            `/admin/login?error=db&callbackUrl=${encodeURIComponent(pathname)}`
          );
          return;
        }

        const data = (await res.json()) as AppSession;
        setAppSession(data);
        setChecking(false);
      })
      .catch((err: unknown) => {
        clearTimeout(timeout);
        if (cancelled) return;

        if (err instanceof Error && err.name === "AbortError") {
          if (timedOut) {
            router.replace(
              `/admin/login?error=slow&callbackUrl=${encodeURIComponent(pathname)}`
            );
          }
          return;
        }

        router.replace(
          `/admin/login?error=db&callbackUrl=${encodeURIComponent(pathname)}`
        );
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
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
