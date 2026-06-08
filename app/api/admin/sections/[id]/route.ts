import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { unregisterCmsBlock } from "@/lib/content/homepage-layout-store";
import {
  deleteSection,
  getSectionById,
  updateSection
} from "@/lib/content/sections-store";
import { validateSectionForPublish } from "@/lib/admin/publish-validation";
import { contentSectionInputSchema, formValuesToInput } from "@/lib/content/section-schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  try {
    const section = await getSectionById(id);
    if (!section) {
      return NextResponse.json({ ok: false, message: "Section not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, section });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load section.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  try {
    const body = await req.json();
    const parsed = contentSectionInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid section data." },
        { status: 400 }
      );
    }

    if (parsed.data.published) {
      const issues = validateSectionForPublish(parsed.data);
      if (issues.length > 0) {
        return NextResponse.json(
          {
            ok: false,
            message: `Complete required fields: ${issues[0].label}.`,
            issues
          },
          { status: 400 }
        );
      }
    }

    const section = await updateSection(id, formValuesToInput(parsed.data));
    return NextResponse.json({ ok: true, section });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update section.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  try {
    await unregisterCmsBlock(id);
    await deleteSection(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete section.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
