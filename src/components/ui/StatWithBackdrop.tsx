import { cn } from "@/lib/utils";

type StatWithBackdropProps = {
  value: number | string | React.ReactNode;
  suffix?: string;
  label: string;
  backdrop?: string;
  theme?: "dark" | "light";
  className?: string;
};

export function StatWithBackdrop({
  value,
  suffix = "",
  label,
  backdrop,
  theme = "dark",
  className,
}: StatWithBackdropProps) {
  const isDark = theme === "dark";

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {backdrop && (
        <span
          className={cn(
            "pointer-events-none absolute -left-1 -top-3 font-display text-5xl font-medium leading-none select-none sm:text-6xl md:text-7xl",
            isDark ? "text-gold/15" : "text-gold/20"
          )}
          aria-hidden
        >
          {backdrop}
        </span>
      )}
      <p
        className={cn(
          "relative font-display text-2xl sm:text-3xl",
          isDark ? "text-gold" : "text-foreground"
        )}
      >
        {typeof value === "number" || typeof value === "string" ? (
          <>
            {value}
            {suffix}
          </>
        ) : (
          value
        )}
      </p>
      <p
        className={cn(
          "relative mt-0.5 text-[10px] leading-tight tracking-wide uppercase sm:text-xs",
          isDark ? "text-stone-500" : "text-muted"
        )}
      >
        {label}
      </p>
    </div>
  );
}
