import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getPayslipPdfBuffer } from "@/lib/hr/payslip-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const guard = await requireApiPermission(PERMISSIONS.hr);
  if (guard.error) return guard.error;

  const { id } = await params;
  const result = await getPayslipPdfBuffer(id);

  if (!result) {
    return NextResponse.json({ error: "Bulletin introuvable" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
