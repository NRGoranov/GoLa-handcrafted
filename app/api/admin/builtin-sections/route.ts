import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { listBuiltinSections } from "@/lib/content/builtin-section-store";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const sections = await listBuiltinSections();
    return NextResponse.json({ ok: true, sections });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load built-in sections.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
