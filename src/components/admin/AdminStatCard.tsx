"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus, type LucideIcon } from "lucide-react";
import { AdminCardIcon } from "@/components/admin/AdminCardIcon";
import { getStatCardIcon } from "@/lib/admin/card-icons";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
  trend?: "up" | "down" | "neutral";
  index?: number;
  icon?: LucideIcon;
};

export function AdminStatCard({
  label,
  value,
  suffix = "",
  hint,
  trend = "neutral",
  index = 0,
  icon,
}: AdminStatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const StatIcon = icon ?? getStatCardIcon(label);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{
        y: -6,
        scale: 1.02,
        boxShadow: "0 20px 50px rgba(201, 169, 98, 0.15)",
        borderColor: "rgba(201, 169, 98, 0.5)",
      }}
      className="admin-card group relative overflow-hidden border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 bg-gold/15 blur-2xl transition-all duration-500 group-hover:bg-gold/25" />
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gold transition-all duration-500 group-hover:w-full" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-muted uppercase">
          {label}
        </p>
        <AdminCardIcon icon={StatIcon} size="sm" />
      </div>
      <p className="relative mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">
        {value}
        {suffix && (
          <span className="text-lg text-muted sm:text-xl">{suffix}</span>
        )}
      </p>
      {hint && (
        <p className="relative mt-3 flex items-center gap-1.5 text-xs text-muted">
          <TrendIcon
            className={cn(
              "h-3.5 w-3.5",
              trend === "up" && "text-emerald-600",
              trend === "down" && "text-red-500",
              trend === "neutral" && "text-stone-400"
            )}
          />
          {hint}
        </p>
      )}
    </motion.div>
  );
}
