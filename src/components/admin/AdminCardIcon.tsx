import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminCardIconProps = {
  icon: LucideIcon;
  size?: "sm" | "md";
  className?: string;
};

export function AdminCardIcon({
  icon: Icon,
  size = "md",
  className,
}: AdminCardIconProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center border border-gold/25 bg-gold/10",
        size === "sm" ? "h-8 w-8" : "h-9 w-9",
        className
      )}
    >
      <Icon
        className={cn("text-gold", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")}
        strokeWidth={1.75}
      />
    </span>
  );
}
