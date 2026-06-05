import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireApiPermission(PERMISSIONS.dashboard);
  if (guard.error) return guard.error;

  const [clientGroups, pendingQuotes, pipelineActive, tasksFollowUp] =
    await Promise.all([
      prisma.quoteRequest.groupBy({
        by: ["email"],
        _count: { _all: true },
      }),
      prisma.quoteRequest.count({ where: { status: "NEW" } }),
      prisma.quoteRequest.count({
        where: { status: { in: ["NEW", "IN_PROGRESS", "REPLIED"] } },
      }),
      prisma.quoteRequest.count({ where: { status: "IN_PROGRESS" } }),
    ]);

  return NextResponse.json({
    clients: clientGroups.length,
    pendingQuotes,
    pipeline: pipelineActive,
    tasks: tasksFollowUp,
  });
}
