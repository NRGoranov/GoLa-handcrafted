import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { getBuiltinSection, updateBuiltinSection } from "@/lib/content/builtin-section-store";
import { isBuiltinSectionKey } from "@/types/builtin-section";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { key } = await params;
  if (!isBuiltinSectionKey(key)) {
    return NextResponse.json({ ok: false, message: "Unknown section." }, { status: 404 });
  }

  try {
    const section = await getBuiltinSection(key);
    return NextResponse.json({ ok: true, section });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load section.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { key } = await params;
  if (!isBuiltinSectionKey(key)) {
    return NextResponse.json({ ok: false, message: "Unknown section." }, { status: 404 });
  }

  try {
    const body = (await req.json()) as {
      contentEn?: Record<string, unknown>;
      contentBg?: Record<string, unknown>;
      imageUrl?: string | null;
    };

    const section = await updateBuiltinSection(key, {
      contentEn: body.contentEn ?? {},
      contentBg: body.contentBg ?? {},
      imageUrl: body.imageUrl ?? null
    });

    return NextResponse.json({ ok: true, section });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save section.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
