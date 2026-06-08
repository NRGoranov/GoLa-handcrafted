import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { listProducts, seedDefaultProducts } from "@/lib/products/products-store";

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await req.json().catch(() => ({}))) as { force?: boolean };
    const inserted = await seedDefaultProducts({ force: body.force === true });
    const products = await listProducts({ skipSeed: true });
    return NextResponse.json({
      ok: true,
      inserted,
      products,
      message:
        inserted > 0
          ? `Loaded ${inserted} default products into the database.`
          : "Products table already has data. Use force to overwrite defaults."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to seed products.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
