import { giftBoxGalleryImages } from "./giftBoxAssets";
import { mergeCustomizationOptions, resolveCustomizationOptions } from "./products/customization-options";
import type { ResolvedProductOption } from "@/types/product-customization";

export type ProductKind = "handbag" | "giftBox";

type ProductBase = {
  id: string;
  categorySlug?: string | null;
  name: string;
  description: string;
  cardSummary?: string;
  dimensions: string;
  widthCm: string;
  heightCm: string;
  thicknessCm: string;
  priceEur: number;
  images: string[];
  customizable: true;
  customizationOptions: ResolvedProductOption[];
};

export type HandbagProduct = ProductBase & {
  productKind: "handbag";
  model: number;
  pocketsAddOnEur: number;
  engravingAddOnEur: number;
};

export type GiftBoxProduct = ProductBase & {
  productKind: "giftBox";
};

export type Product = HandbagProduct | GiftBoxProduct;

function resolveStaticOptions(
  productKind: ProductKind,
  engravingAddOnEur: number | null = 20
): ResolvedProductOption[] {
  return resolveCustomizationOptions(
    mergeCustomizationOptions(null, productKind, engravingAddOnEur),
    "en"
  );
}

const handbagProductsBase = [
  {
    productKind: "handbag",
    id: "model-1",
    categorySlug: null,
    model: 1,
    name: "Model 1",
    description:
      "Defined by compact elegance and refined presence, crafted for everyday distinction.",
    dimensions: "23 x 15,6 x 7,4 cm",
    widthCm: "23",
    heightCm: "15,6",
    thicknessCm: "7,4",
    priceEur: 120,
    pocketsAddOnEur: 20,
    engravingAddOnEur: 20,
    images: [
      "/images/model1/model1-1.jpeg",
      "/images/model1/model1-2.jpeg",
      "/images/model1/model1-3.jpeg",
      "/images/model1/model1-4.jpeg",
      "/images/model1/model1-5.jpeg",
      "/images/model1/model1-6.jpeg"
    ],
    customizable: true
  },
  {
    productKind: "handbag",
    id: "model-2",
    categorySlug: null,
    model: 2,
    name: "Model 2",
    description:
      "Balanced in proportion and rich in texture, made for those who favor understated statement pieces.",
    dimensions: "22 x 14 x 6,5 cm",
    widthCm: "22",
    heightCm: "14",
    thicknessCm: "6,5",
    priceEur: 100,
    pocketsAddOnEur: 20,
    engravingAddOnEur: 20,
    images: [
      "/images/model2/model2-1.jpeg",
      "/images/model2/model2-2.jpeg",
      "/images/model2/model2-3.jpeg",
      "/images/model2/model2-4.jpeg"
    ],
    customizable: true
  },
  {
    productKind: "handbag",
    id: "model-3",
    categorySlug: null,
    model: 3,
    name: "Model 3",
    description:
      "Sculpted with bold character and spacious intent, elevating travel and occasion with artisan depth.",
    dimensions: "22 x 11,5 x 6 cm",
    widthCm: "22",
    heightCm: "11,5",
    thicknessCm: "6",
    priceEur: 90,
    pocketsAddOnEur: 20,
    engravingAddOnEur: 20,
    images: [
      "/images/model3/model3-1.jpeg",
      "/images/model3/model3-2.jpeg",
      "/images/model3/model3-3.jpeg",
      "/images/model3/model3-4.jpeg",
      "/images/model3/model3-5.jpeg"
    ],
    customizable: true
  },
  {
    productKind: "handbag",
    id: "model-4",
    categorySlug: null,
    model: 4,
    name: "Model 4",
    description:
      "A lighter silhouette with poised proportions, designed for refined everyday carry.",
    dimensions: "17 x 11,5 x 6 cm",
    widthCm: "17",
    heightCm: "11,5",
    thicknessCm: "6",
    priceEur: 70,
    pocketsAddOnEur: 20,
    engravingAddOnEur: 20,
    images: ["/images/model4/model4-1.jpeg", "/images/model4/model4-2.jpeg"],
    customizable: true
  }
];

export const handbagProducts: HandbagProduct[] = handbagProductsBase.map((product) => ({
  ...product,
  productKind: "handbag" as const,
  customizable: true as const,
  customizationOptions: resolveStaticOptions("handbag", product.engravingAddOnEur)
}));

const giftBoxProductsBase = [
  {
    productKind: "giftBox",
    id: "premium-gift-box",
    categorySlug: null,
    name: "Premium Gift Box for Handbags & Jewelry",
    description:
      "Turn your product into a premium gift experience. Handmade wooden packaging — more than a box, part of the presentation.",
    dimensions: "Dimensions on request — tailored to your product",
    widthCm: "—",
    heightCm: "—",
    thicknessCm: "—",
    priceEur: 25,
    images: giftBoxGalleryImages(),
    customizable: true
  }
];

export const giftBoxProducts: GiftBoxProduct[] = giftBoxProductsBase.map((product) => ({
  ...product,
  productKind: "giftBox" as const,
  customizable: true as const,
  customizationOptions: resolveStaticOptions("giftBox")
}));

export const products: Product[] = [...handbagProducts, ...giftBoxProducts];

export function isHandbag(product: Product): product is HandbagProduct {
  return product.productKind === "handbag";
}

export function isGiftBox(product: Product): product is GiftBoxProduct {
  return product.productKind === "giftBox";
}
