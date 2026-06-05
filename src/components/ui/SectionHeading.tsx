"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  theme?: "light" | "dark";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  theme = "light",
  className,
}: SectionHeadingProps) {
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        align === "center" && "items-center",
        align === "left" && "text-left",
        "flex flex-col",
        className
      )}
    >
      {eyebrow && (
        <>
          <p className={cn("label-upper", isDark && "text-gold")}>{eyebrow}</p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "divider-gold mt-4 mb-6 origin-left",
              align === "center" && "mx-auto origin-center"
            )}
          />
        </>
      )}
      <h2
        className={cn(
          "heading-section",
          isDark && "text-cream"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-relaxed sm:text-lg",
            isDark ? "text-stone-400" : "text-muted",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
