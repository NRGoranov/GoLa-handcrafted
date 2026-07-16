"use client";

import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { getCopy } from "@/lib/i18n";
import { productRecordToProduct } from "@/lib/products/map-product";
import type { Product } from "@/lib/products";
import type { ProductRecordInput } from "@/types/product-record";

export default function ProductLivePreview({
  product,
  locale = "en",
  giftBoxProduct = null,
  handbagItems = []
}: {
  product: ProductRecordInput;
  locale?: "en" | "bg";
  giftBoxProduct?: Product | null;
  handbagItems?: Product[];
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const preview = useMemo(() => {
    const sanitizedImages = (product.images ?? []).filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0
    );

    return productRecordToProduct(
      {
        ...product,
        images: sanitizedImages,
        createdAt: "",
        updatedAt: ""
      },
      locale
    );
  }, [product, locale]);

  const summary =
    product.cardSummary[locale]?.trim() ||
    product.description[locale]?.trim().slice(0, 120) ||
    "—";

  const copy = getCopy(locale).product;

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <>
      <div className="w-full max-w-sm">
        <ProductCard
          product={preview}
          summary={summary}
          onView={openModal}
          copy={{
            viewDetails: copy.viewDetails,
            aria: { viewDetailsFor: copy.aria.viewDetailsFor }
          }}
        />
      </div>

      {modalOpen && typeof document !== "undefined"
        ? createPortal(
            <ProductModal
              product={preview}
              giftBoxProduct={giftBoxProduct}
              handbagItems={handbagItems}
              onClose={closeModal}
              copy={copy}
            />,
            document.body
          )
        : null}
    </>
  );
}
