"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  ActivityFeed,
  RecentClientsList,
  TasksWidget,
  UpcomingEvents,
} from "@/components/admin/DashboardWidgets";
import {
  EventTypeChart,
  LeadsChartAnimated,
  PipelineChart,
  RevenueChartAnimated,
} from "@/components/admin/DashboardCharts";
import { adminDashboardStats } from "@/data/admin-mock";
import { brand } from "@/config/brand";
import { quickActions } from "@/data/admin-mock";

function WelcomeBanner() {
  const date = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="admin-welcome mb-8 overflow-hidden px-6 py-8 text-cream sm:px-8 sm:py-10"
    >
      <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
        {date}
      </p>
      <h2 className="mt-3 max-w-xl font-display text-2xl font-medium sm:text-3xl">
        Pilotez {brand.name} en un seul endroit
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-400">
        Clients, devis, événements et performance — tableau de bord complet.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <motion.div
            key={action.href}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={action.href}
              className="inline-block border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-medium text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              {action.label}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function AdminDashboard() {
  return (
    <>
      <WelcomeBanner />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {adminDashboardStats.map((stat, index) => (
          <AdminStatCard
            key={stat.label}
            index={index}
            label={stat.label}
            value={stat.value}
            suffix={"suffix" in stat ? stat.suffix : undefined}
            hint={stat.hint}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <RevenueChartAnimated />
        <LeadsChartAnimated />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PipelineChart />
        </div>
        <EventTypeChart />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentClientsList />
        </div>
        <ActivityFeed />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <UpcomingEvents />
        <TasksWidget />
      </div>
    </>
  );
}
