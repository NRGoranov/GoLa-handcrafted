"use client";

import AdminImage from "@/components/admin/AdminImage";
import { productRecordToProduct } from "@/lib/products/map-product";
import type { ProductRecordInput } from "@/types/product-record";

export default function ProductLivePreview({
  product,
  locale = "en"
}: {
  product: ProductRecordInput;
  locale?: "en" | "bg";
}) {
  const preview = productRecordToProduct(
    {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    locale
  );

  const image = preview.images[0];
  const summary =
    product.cardSummary[locale]?.trim() ||
    product.description[locale]?.trim().slice(0, 120) ||
    "—";

  return (
    <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ink shadow-2xl">
      <div className="border-b border-ivory/10 bg-[#111] px-4 py-2 text-xs uppercase tracking-[0.16em] text-mist">
        Card preview · {product.published ? "Published" : "Draft"}
      </div>
      <div className="p-6">
        <article className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-ivory/10 bg-[#111]">
          <div className="relative aspect-[3/4] bg-black/30">
            {image ? (
              <AdminImage src={image} alt={preview.name} fill className="object-cover" sizes="320px" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-mist">No image</div>
            )}
          </div>
          <div className="space-y-2 p-4">
            <h3 className="font-serif text-xl text-ivory">{preview.name}</h3>
            <p className="text-sm text-mist">{summary}</p>
            <p className="text-sm font-medium text-caramel">€{preview.priceEur}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
