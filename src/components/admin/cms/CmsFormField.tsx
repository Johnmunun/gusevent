import { cn } from "@/lib/utils";

type CmsFormFieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function CmsFormField({ label, children, className }: CmsFormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

export const cmsInputClass =
  "w-full border border-border bg-cream px-3 py-2 text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20";

export const cmsTextareaClass =
  "w-full min-h-[100px] border border-border bg-cream px-3 py-2 text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20";
