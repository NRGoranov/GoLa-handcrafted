import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { revalidatePublicHomepages } from "@/lib/content/revalidate-public";
import { validateProductForPublish } from "@/lib/admin/publish-validation";
import { deleteProduct, getProduct, updateProduct } from "@/lib/products/products-store";
import { normalizeProductRecordInput } from "@/lib/products/product-placement";
import type { ProductRecordInput } from "@/types/product-record";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json({ ok: false, message: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load product.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = (await req.json()) as ProductRecordInput;
    const input = normalizeProductRecordInput({ ...body, id });

    if (input.published) {
      const issues = validateProductForPublish(input);
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

    const product = await updateProduct(id, input);
    revalidatePublicHomepages();
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save product.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete product.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
