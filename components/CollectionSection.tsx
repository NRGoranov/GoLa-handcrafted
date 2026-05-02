"use client";

import { type Product } from "@/lib/products";
import { getLocalizedProductPreview, type Locale } from "@/lib/i18n";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";

type CollectionCopy = { eyebrow: string; title: string; description: string };

type ProductCardCopy = {
  viewDetails: string;
  aria: { viewDetailsFor: string };
};

export default function CollectionSection({
  copy,
  locale,
  productCardCopy,
  items,
  sectionId = "collection",
  onViewProduct
}: {
  copy: CollectionCopy;
  locale: Locale;
  productCardCopy: ProductCardCopy;
  items: Product[] | undefined;
  sectionId?: string;
  onViewProduct: (product: Product) => void;
}) {
  const list = items ?? [];
  const localizedProducts = list.map((product) => {
    const preview = getLocalizedProductPreview(locale, product);
    return {
      ...product,
      name: preview.name,
      description: preview.detailDescription,
      cardSummary: preview.cardSummary
    };
  });

  return (
    <section id={sectionId} className="container-luxury py-20 sm:py-24">
      <SectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <div className="grid gap-6 md:grid-cols-3 md:[&>*:last-child:nth-child(3n+1)]:col-start-2">
        {localizedProducts.map(({ cardSummary, ...product }) => (
          <ProductCard
            key={product.id}
            product={product}
            summary={cardSummary}
            onView={onViewProduct}
            copy={productCardCopy}
          />
        ))}
      </div>
    </section>
  );
}
