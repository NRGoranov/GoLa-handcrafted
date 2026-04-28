"use client";

import { useState } from "react";
import { products, type Product } from "@/lib/products";
import { getLocalizedProduct, type Locale } from "@/lib/i18n";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import SectionHeading from "./SectionHeading";

type CollectionCopy = { eyebrow: string; title: string; description: string };

export default function CollectionSection({
  copy,
  locale,
  productCopy
}: {
  copy: CollectionCopy;
  locale: Locale;
  productCopy: {
    viewDetails: string;
    close: string;
    requestThisPiece: string;
    labels: {
      model: string;
      dimensions: string;
      dimensionsHint: string;
      price: string;
      availability: string;
      customization: string;
      inside: string;
      liningColor: string;
      insidePockets: string;
      engraving: string;
      woodCoatingColor: string;
      chainColor: string;
    };
    values: {
      availabilityByInquiry: string;
      customizationYes: string;
      customizationNo: string;
      insideLeather: string;
    };
    options: {
      colors: string[];
      woodCoatingColors: string[];
      chainColors: string[];
      pocketsAdds: string; // "{amount}" placeholder
      engravingAdds: string; // "{amount}" placeholder
    };
    aria: {
      viewDetailsFor: string;
      modalLabel: string;
      viewImage: string;
      viewNamedImage: string;
      thumbnail: string;
    };
  };
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const localizedProducts = products.map((product) => {
    const localized = getLocalizedProduct(locale, product);
    return { ...product, ...localized };
  });

  return (
    <section id="collection" className="container-luxury py-20 sm:py-24">
      <SectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <div className="grid gap-6 md:grid-cols-3 md:[&>*:last-child:nth-child(3n+1)]:col-start-2">
        {localizedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={setSelectedProduct}
            copy={{ viewDetails: productCopy.viewDetails, aria: { viewDetailsFor: productCopy.aria.viewDetailsFor } }}
          />
        ))}
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} copy={productCopy} />
    </section>
  );
}
