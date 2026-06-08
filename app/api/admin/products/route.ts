import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { createDraftProduct, listProducts, seedDefaultProducts } from "@/lib/products/products-store";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    let products = await listProducts();
    if (products.length === 0) {
      await seedDefaultProducts();
      products = await listProducts({ skipSeed: true });
    }
    return NextResponse.json({ ok: true, products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load products.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await req.json().catch(() => ({}))) as { kind?: string };
    const kind = body.kind === "giftBox" ? "giftBox" : "handbag";
    const product = await createDraftProduct(kind);
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
