"use client";

import { motion } from "framer-motion";
import { pipelineColumns, type MockClient } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

function PipelineCard({ client }: { client: MockClient }) {
  return (
    <motion.article
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(10,9,8,0.1)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="cursor-pointer border border-border bg-surface p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-foreground">{client.name}</p>
        {client.priority === "haute" && (
          <span className="shrink-0 bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-gold uppercase">
            Priorité
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">{client.eventType}</p>
      <p className="mt-2 text-xs text-foreground">{client.budget}</p>
      <p className="mt-3 text-[10px] text-muted">{client.eventDate}</p>
    </motion.article>
  );
}

export function PipelineBoard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {pipelineColumns.map((col) => (
        <div
          key={col.id}
          className={cn("admin-pipeline-col border-t-4 p-4", col.color)}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {col.title}
            </h3>
            <span className="flex h-6 min-w-6 items-center justify-center bg-ink px-1.5 text-xs font-medium text-cream">
              {col.clients.length}
            </span>
          </div>
          <div className="space-y-3">
            {col.clients.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted">
                Aucun dossier
              </p>
            ) : (
              col.clients.map((client) => (
                <PipelineCard key={client.id} client={client} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
