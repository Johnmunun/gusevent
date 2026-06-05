"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell flex min-h-screen">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm transition-opacity lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      <AdminSidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-screen shadow-2xl transition-transform",
          "lg:sticky lg:top-0 lg:self-start",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          title={title}
          description={description}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="admin-main flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
