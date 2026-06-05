import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/app-session";

export async function GET() {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.json(
      { error: "Non autorisé pour le panneau admin" },
      { status: 401 }
    );
  }
  return NextResponse.json(session);
}
