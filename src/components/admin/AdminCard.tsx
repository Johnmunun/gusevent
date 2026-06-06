"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AdminCardIcon } from "@/components/admin/AdminCardIcon";
import { cn } from "@/lib/utils";

type AdminCardProps = {
  title?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hover?: boolean;
};

export function AdminCard({
  title,
  icon,
  action,
  children,
  className,
  noPadding,
  hover = true,
}: AdminCardProps) {
  const Wrapper = hover ? motion.section : "section";

  const hoverProps = hover
    ? {
        whileHover: {
          y: -5,
          boxShadow: "0 16px 48px rgba(10, 9, 8, 0.1)",
          borderColor: "rgba(201, 169, 98, 0.45)",
        },
        transition: { type: "spring" as const, stiffness: 400, damping: 28 },
      }
    : {};

  return (
    <Wrapper
      {...hoverProps}
      className={cn(
        "admin-card overflow-hidden border border-border bg-surface shadow-sm",
        hover && "transition-colors duration-300",
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {icon ? <AdminCardIcon icon={icon} /> : null}
            <h2 className="font-display text-lg font-medium text-foreground">
              {title}
            </h2>
          </div>
          {action}
        </div>
      )}
      <div className={cn(!noPadding && "p-5 sm:p-6")}>{children}</div>
    </Wrapper>
  );
}
