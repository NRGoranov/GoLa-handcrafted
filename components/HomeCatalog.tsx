"use client";

import { useState } from "react";
import { handbagProducts, type Product } from "@/lib/products";
import { getCopy, type Locale } from "@/lib/i18n";
import CollectionSection from "./CollectionSection";
import ProductModal from "./ProductModal";

type HomeCatalogCopy = Pick<ReturnType<typeof getCopy>, "collection" | "product">;

export default function HomeCatalog({
  locale,
  copy
}: {
  locale: Locale;
  copy: HomeCatalogCopy;
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const productCardCopy = {
    viewDetails: copy.product.viewDetails,
    aria: {
      viewDetailsFor: copy.product.aria.viewDetailsFor
    }
  };

  return (
    <>
      <CollectionSection
        copy={copy.collection}
        locale={locale}
        productCardCopy={productCardCopy}
        items={handbagProducts}
        sectionId="collection"
        onViewProduct={setSelectedProduct}
      />
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        copy={copy.product}
      />
    </>
  );
}
