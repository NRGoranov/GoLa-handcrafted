import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  getHomepageLayoutRecord,
  updateHomepageLayout
} from "@/lib/content/homepage-layout-store";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const layout = await getHomepageLayoutRecord();
    return NextResponse.json({ ok: true, layout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load homepage layout.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await req.json()) as { blockOrder?: string[] };
    if (!Array.isArray(body.blockOrder)) {
      return NextResponse.json({ ok: false, message: "blockOrder array is required." }, { status: 400 });
    }

    const layout = await updateHomepageLayout(body.blockOrder);
    return NextResponse.json({ ok: true, layout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save homepage layout.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
