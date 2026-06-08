import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  createGalleryGroup,
  listGalleryGroups,
  recordsToGalleryGroups,
  reorderGalleryGroups,
  syncFilesystemGalleryImages
} from "@/lib/gallery/gallery-store";
import { isLocale } from "@/lib/i18n";

export async function GET(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const rawLocale = searchParams.get("locale") ?? "en";
    const locale = isLocale(rawLocale) ? rawLocale : "en";
    const records = await listGalleryGroups();
    const groups = recordsToGalleryGroups(records, locale);
    const imageCount = records.reduce((total, group) => total + group.images.length, 0);

    return NextResponse.json({ ok: true, records, groups, imageCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load gallery.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await req.json()) as {
      action?: string;
      labelEn?: string;
      labelBg?: string;
    };

    if (body.action === "sync") {
      const records = await syncFilesystemGalleryImages();
      return NextResponse.json({ ok: true, records, imageCount: records.reduce((t, g) => t + g.images.length, 0) });
    }

    const group = await createGalleryGroup({
      labelEn: body.labelEn ?? "New group",
      labelBg: body.labelBg ?? "Нова група"
    });
    return NextResponse.json({ ok: true, group });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create gallery group.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await req.json()) as { groupIds?: string[] };
    if (!Array.isArray(body.groupIds)) {
      return NextResponse.json({ ok: false, message: "groupIds array is required." }, { status: 400 });
    }

    const records = await reorderGalleryGroups(body.groupIds);
    return NextResponse.json({ ok: true, records });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reorder gallery groups.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
