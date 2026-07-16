"use client";

import CmsImage from "@/components/CmsImage";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import { GIFT_BOX_HERO_IMAGE } from "@/lib/giftBoxAssets";
import { intrinsicContainMaxStyle, intrinsicSizesHalfWidthGrid } from "@/lib/intrinsicImages";
import { type Product } from "@/lib/products";
import { getGiftBoxStartingPrice } from "@/lib/products/customization-options";
import { getLocalizedProductPreview, type Locale } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";
import ProductModal from "./ProductModal";

type ProductModalCopy = ComponentProps<typeof ProductModal>["copy"];

export default function GiftBoxSection({
  locale,
  sectionCopy,
  productCopy,
  product,
  handbagItems = [],
  earringItems = [],
  viewDetailsLabel,
  viewDetailsAriaTemplate
}: {
  locale: Locale;
  product: Product;
  handbagItems?: Product[];
  earringItems?: Product[];
  sectionCopy: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: [string, string, string];
    imageAlt: string;
  };
  productCopy: ProductModalCopy;
  viewDetailsLabel: string;
  viewDetailsAriaTemplate: string;
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const preview = getLocalizedProductPreview(locale, product);
  const productForModal = useMemo<Product>(
    () => ({
      ...product,
      name: preview.name,
      description: preview.detailDescription,
      cardSummary: product.cardSummary?.trim() || preview.cardSummary
    }),
    [product, preview.name, preview.detailDescription, preview.cardSummary]
  );
  const localizedHandbags = useMemo(
    () =>
      handbagItems.map((item) => {
        const itemPreview = getLocalizedProductPreview(locale, item);
        return {
          ...item,
          name: itemPreview.name,
          description: itemPreview.detailDescription,
          cardSummary: item.cardSummary?.trim() || itemPreview.cardSummary
        };
      }),
    [handbagItems, locale]
  );
  const localizedEarrings = useMemo(
    () =>
      earringItems.map((item) => {
        const itemPreview = getLocalizedProductPreview(locale, item);
        return {
          ...item,
          name: itemPreview.name,
          description: itemPreview.detailDescription,
          cardSummary: item.cardSummary?.trim() || itemPreview.cardSummary
        };
      }),
    [earringItems, locale]
  );
  const startingPrice = getGiftBoxStartingPrice(productForModal);
  const heroImage = product.images[0] ?? GIFT_BOX_HERO_IMAGE;

  const openDetails = () => setSelectedProduct(productForModal);
  const closeDetails = useCallback(() => setSelectedProduct(null), []);

  const viewDetailsAria = viewDetailsAriaTemplate.replace("{name}", preview.name);

  return (
    <>
      <section id="gift-box" className="border-y border-ivory/10 bg-[#0f0f0f] py-20 sm:py-24">
        <div className="container-luxury grid items-center gap-10 md:grid-cols-2">
          <button
            type="button"
            onClick={openDetails}
            aria-label={viewDetailsAria}
            className="focus-ring relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-2xl border border-ivory/10 md:order-2"
            style={intrinsicContainMaxStyle(heroImage)}
          >
            <CmsImage
              src={heroImage}
              alt={sectionCopy.imageAlt}
              fill
              className="object-cover transition duration-300 hover:scale-[1.02]"
              sizes={intrinsicSizesHalfWidthGrid(heroImage)}
            />
          </button>

          <div className="md:order-1">
            <SectionHeading
              eyebrow={sectionCopy.eyebrow}
              title={sectionCopy.title}
              description={sectionCopy.description}
            />
            <ul className="space-y-4 text-sm text-mist sm:text-base">
              <li>{sectionCopy.bullets[0]}</li>
              <li>{sectionCopy.bullets[1]}</li>
              <li>{sectionCopy.bullets[2]}</li>
            </ul>
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-caramel/90">
              {productCopy.priceFrom.replace("{amount}", String(startingPrice))}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={openDetails}
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-caramel px-5 py-2.5 text-sm text-caramel transition hover:bg-caramel hover:text-ink"
              >
                {viewDetailsLabel}
              </button>
              <a
                href="#inquiry"
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-caramel px-5 py-2.5 text-sm font-medium text-ink"
              >
                {productCopy.requestThisPiece}
              </a>
            </div>
          </div>
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        giftBoxProduct={productForModal}
        handbagItems={localizedHandbags}
        earringItems={localizedEarrings}
        onClose={closeDetails}
        copy={productCopy}
      />
    </>
  );
}
