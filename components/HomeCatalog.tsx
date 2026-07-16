"use client";

import { useCallback, useMemo, useState } from "react";
import { type Product } from "@/lib/products";
import { getCopy, getLocalizedProductPreview, type Locale } from "@/lib/i18n";
import CollectionSection from "./CollectionSection";
import ProductModal from "./ProductModal";

type HomeCatalogCopy = Pick<ReturnType<typeof getCopy>, "collection" | "product">;

export default function HomeCatalog({
  locale,
  copy,
  items,
  giftBoxProduct
}: {
  locale: Locale;
  copy: HomeCatalogCopy;
  items: Product[];
  giftBoxProduct?: Product | null;
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const giftBoxForModal = useMemo(() => {
    if (!giftBoxProduct) return null;
    const preview = getLocalizedProductPreview(locale, giftBoxProduct);
    return {
      ...giftBoxProduct,
      name: preview.name,
      description: preview.detailDescription,
      cardSummary: giftBoxProduct.cardSummary?.trim() || preview.cardSummary
    };
  }, [giftBoxProduct, locale]);

  const productCardCopy = {
    viewDetails: copy.product.viewDetails,
    aria: {
      viewDetailsFor: copy.product.aria.viewDetailsFor
    }
  };

  const closeModal = useCallback(() => setSelectedProduct(null), []);

  return (
    <>
      <CollectionSection
        copy={copy.collection}
        locale={locale}
        productCardCopy={productCardCopy}
        items={items}
        sectionId="collection"
        onViewProduct={setSelectedProduct}
      />
      <ProductModal
        product={selectedProduct}
        giftBoxProduct={giftBoxForModal}
        onClose={closeModal}
        copy={copy.product}
      />
    </>
  );
}
