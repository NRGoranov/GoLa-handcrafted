import { getCopy } from "@/lib/i18n";
import { mergeCustomizationOptions } from "@/lib/products/customization-options";
import { giftBoxProducts, handbagProducts } from "@/lib/products";
import type { ProductRecord } from "@/types/product-record";

export function getDefaultProductRecords(): ProductRecord[] {
  const now = new Date().toISOString();
  const enCopy = getCopy("en");
  const bgCopy = getCopy("bg");

  const handbags: ProductRecord[] = handbagProducts.map((product, index) => {
    const enModel = enCopy.product.models[product.id];
    const bgModel = bgCopy.product.models[product.id];

    return {
      id: product.id,
      productKind: "handbag",
      categorySlug: product.categorySlug ?? null,
      sortOrder: index,
      published: true,
      model: product.model,
      name: { en: enModel?.name ?? product.name, bg: bgModel?.name ?? product.name },
      description: {
        en: enModel?.description ?? product.description,
        bg: bgModel?.description ?? product.description
      },
      cardSummary: {
        en: enModel?.cardSummary ?? product.description.slice(0, 160),
        bg: bgModel?.cardSummary ?? product.description.slice(0, 160)
      },
      dimensions: product.dimensions,
      widthCm: product.widthCm,
      heightCm: product.heightCm,
      thicknessCm: product.thicknessCm,
      priceEur: product.priceEur,
      pocketsAddOnEur: product.pocketsAddOnEur,
      engravingAddOnEur: product.engravingAddOnEur,
      customizationOptions: mergeCustomizationOptions(null, "handbag", product.engravingAddOnEur),
      images: [...product.images],
      createdAt: now,
      updatedAt: now
    };
  });

  const gift = giftBoxProducts[0];
  const enGift = enCopy.product.models[gift.id];
  const bgGift = bgCopy.product.models[gift.id];

  const giftBox: ProductRecord = {
    id: gift.id,
    productKind: "giftBox",
    categorySlug: gift.categorySlug ?? null,
    sortOrder: handbags.length,
    published: true,
    model: null,
    name: { en: enGift?.name ?? gift.name, bg: bgGift?.name ?? gift.name },
    description: {
      en: enGift?.description ?? gift.description,
      bg: bgGift?.description ?? gift.description
    },
    cardSummary: {
      en: enGift?.cardSummary ?? gift.description.slice(0, 160),
      bg: bgGift?.cardSummary ?? gift.description.slice(0, 160)
    },
    dimensions: gift.dimensions,
    widthCm: gift.widthCm,
    heightCm: gift.heightCm,
    thicknessCm: gift.thicknessCm,
    priceEur: gift.priceEur,
    pocketsAddOnEur: null,
    engravingAddOnEur: null,
    customizationOptions: mergeCustomizationOptions(null, "giftBox"),
    images: [...gift.images],
    createdAt: now,
    updatedAt: now
  };

  return [...handbags, giftBox];
}
