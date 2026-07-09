import type { ProductCustomizationOption } from "@/types/product-customization";

export type ProductKind = "handbag" | "giftBox";

export type LocalizedText = {
  en: string;
  bg: string;
};

export type ProductRecord = {
  id: string;
  productKind: ProductKind;
  /**
   * Optional category anchor. We store the CMS section slug so products can be
   * grouped/rendered inside dynamic "product grid" CMS sections.
   */
  categorySlug: string | null;
  sortOrder: number;
  published: boolean;
  model: number | null;
  name: LocalizedText;
  description: LocalizedText;
  cardSummary: LocalizedText;
  dimensions: string;
  widthCm: string;
  heightCm: string;
  thicknessCm: string;
  priceEur: number;
  pocketsAddOnEur: number | null;
  engravingAddOnEur: number | null;
  customizationOptions: ProductCustomizationOption[] | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProductRecordInput = Omit<ProductRecord, "createdAt" | "updatedAt">;
