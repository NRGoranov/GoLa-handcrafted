import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { revalidatePublicHomepages } from "@/lib/content/revalidate-public";
import { reorderProducts } from "@/lib/products/products-store";

export async function PUT(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await req.json()) as { ids?: string[] };
    if (!Array.isArray(body.ids)) {
      return NextResponse.json({ ok: false, message: "ids array is required." }, { status: 400 });
    }

    const products = await reorderProducts(body.ids);
    revalidatePublicHomepages();
    return NextResponse.json({ ok: true, products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reorder products.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
