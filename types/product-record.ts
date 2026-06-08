export type ProductKind = "handbag" | "giftBox";

export type LocalizedText = {
  en: string;
  bg: string;
};

export type ProductRecord = {
  id: string;
  productKind: ProductKind;
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
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProductRecordInput = Omit<ProductRecord, "createdAt" | "updatedAt">;
