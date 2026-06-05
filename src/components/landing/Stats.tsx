"use client";

import { motion } from "framer-motion";
import { stats } from "@/data/landing";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { StatWithBackdrop } from "@/components/ui/StatWithBackdrop";

export function Stats() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-wide">
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="flex flex-col items-center px-8 py-14 text-center lg:py-16"
            >
              {"backdrop" in stat && stat.backdrop ? (
                <div className="flex flex-col items-center">
                  <StatWithBackdrop
                    value={
                      <span className="font-display text-4xl font-medium lg:text-5xl">
                        <AnimatedCounter
                          value={stat.value}
                          suffix={stat.suffix}
                        />
                      </span>
                    }
                    label={stat.label}
                    backdrop={stat.backdrop}
                    theme="light"
                  />
                </div>
              ) : (
                <>
                  <p className="font-display text-4xl font-medium text-foreground lg:text-5xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-3 text-sm tracking-wide text-muted uppercase">
                    {stat.label}
                  </p>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
