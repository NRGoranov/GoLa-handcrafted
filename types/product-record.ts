import type { ProductCustomizationOption } from "@/types/product-customization";

export type ProductKind = "handbag" | "giftBox";

export type LocalizedText = {
  en: string;
  bg: string;
};

/** A fact line whose value is filled from product data on the public page. */
export type ProductDetailBinding =
  | "model"
  | "dimensions"
  | "price"
  | "availability"
  | "customization";

/** One line in the product details popup. */
export type ProductDetail = {
  id: string;
  label: LocalizedText;
  /** Used when `binding` is null. Ignored for bound lines. */
  value: LocalizedText;
  /**
   * When false, the line stays in the admin panel but is hidden on the public product page.
   */
  visible: boolean;
  binding: ProductDetailBinding | null;
};

/** Locale-specific detail passed to the public product popup. */
export type DisplayProductDetail = {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  binding: ProductDetailBinding | null;
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
  /** Handbags only: show the premium gift box add-on on the product details modal. */
  offerGiftBoxUpsell: boolean;
  customizationOptions: ProductCustomizationOption[] | null;
  /**
   * Fact lines in the product popup.
   * `null` means the automatic lines (model, size, price, and inside leather only on the original leather models).
   */
  details: ProductDetail[] | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProductRecordInput = Omit<ProductRecord, "createdAt" | "updatedAt">;
