import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { registerNewCmsBlock } from "@/lib/content/homepage-layout-store";
import {
  createSection,
  listSections,
  createEmptySectionInput
} from "@/lib/content/sections-store";
import { contentSectionInputSchema, formValuesToInput } from "@/lib/content/section-schema";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const sections = await listSections();
    return NextResponse.json({ ok: true, sections });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load sections.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const parsed = contentSectionInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid section data." },
        { status: 400 }
      );
    }

    const section = await createSection(formValuesToInput(parsed.data));
    await registerNewCmsBlock(section.id);
    return NextResponse.json({ ok: true, section });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create section.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const sections = await listSections();
    const nextOrder = sections.length;
    const draft = createEmptySectionInput(nextOrder);
    draft.slug = `section-${Date.now()}`;
    draft.title.en = "New section";
    const section = await createSection(draft);
    await registerNewCmsBlock(section.id);
    return NextResponse.json({ ok: true, section });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create draft section.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
