import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { getVisitStats } from "@/lib/analytics/visit-store";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const stats = await getVisitStats();
    return NextResponse.json({ ok: true, stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load visit stats.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
