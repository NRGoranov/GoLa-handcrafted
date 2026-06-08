import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { deleteGalleryGroup, updateGalleryGroup } from "@/lib/gallery/gallery-store";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    const body = (await req.json()) as {
      labelEn?: string;
      labelBg?: string;
      images?: string[];
      sortOrder?: number;
    };

    const group = await updateGalleryGroup(id, body);
    return NextResponse.json({ ok: true, group });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update gallery group.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    await deleteGalleryGroup(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete gallery group.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
