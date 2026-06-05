import { defaultLandingCms } from "@/lib/cms/defaults";
import { cn } from "@/lib/utils";

type ProjectsBadgeProps = {
  className?: string;
  count?: number;
};

export function ProjectsBadge({
  className,
  count = defaultLandingCms.gallery.items.length,
}: ProjectsBadgeProps) {
  return (
    <div className={cn("relative inline-flex", className)}>
      <span
        className="pointer-events-none absolute -left-3 -top-4 font-display text-5xl font-medium leading-none text-gold/12 select-none sm:text-6xl"
        aria-hidden
      >
        {count}
      </span>
      <span className="relative border border-gold/35 bg-gold/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-gold uppercase sm:text-[11px]">
        {count} projets
      </span>
    </div>
  );
}
