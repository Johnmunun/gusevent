"use client";

import { usePathname } from "next/navigation";
import { AdminAppProvider } from "@/components/admin/AdminAppProvider";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/unauthorized"];

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return <AdminAppProvider>{children}</AdminAppProvider>;
}
