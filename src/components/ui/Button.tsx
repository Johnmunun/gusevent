import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "gold" | "outline-light";
  size?: "md" | "lg";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

const variants = {
  primary: "bg-ink text-cream hover:bg-stone-800",
  gold: "bg-gold text-ink hover:bg-gold-dark",
  secondary:
    "border border-border bg-surface text-foreground hover:border-gold/40 hover:bg-accent-light/30",
  ghost: "text-foreground/80 hover:text-foreground hover:bg-black/5",
  "outline-light":
    "border border-white/25 bg-transparent text-white hover:border-gold hover:text-gold",
};

const sizes = {
  md: "px-6 py-2.5 text-sm tracking-wide",
  lg: "px-8 py-3.5 text-sm tracking-wide",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  children,
  className,
  onClick,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
