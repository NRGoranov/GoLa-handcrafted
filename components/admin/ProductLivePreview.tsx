"use client";

import ProductCard from "@/components/ProductCard";
import { getCopy } from "@/lib/i18n";
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

  const summary =
    product.cardSummary[locale]?.trim() ||
    product.description[locale]?.trim().slice(0, 120) ||
    "—";

  const copy = getCopy(locale).product;

  return (
    <div className="w-full max-w-sm">
      <ProductCard
        product={preview}
        summary={summary}
        onView={() => undefined}
        copy={{
          viewDetails: copy.viewDetails,
          aria: { viewDetailsFor: copy.aria.viewDetailsFor }
        }}
      />
    </div>
  );
}
