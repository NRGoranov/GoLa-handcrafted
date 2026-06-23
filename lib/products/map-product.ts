import type { Locale } from "@/lib/i18n";
import type { GiftBoxProduct, HandbagProduct, Product } from "@/lib/products";
import type { ProductRecord } from "@/types/product-record";

function pickLocalized(text: { en: string; bg: string }, locale: Locale): string {
  return text[locale]?.trim() || text.en || text.bg;
}

export function productRecordToProduct(record: ProductRecord, locale: Locale): Product {
  const name = pickLocalized(record.name, locale);
  const description = pickLocalized(record.description, locale);
  const cardSummary = pickLocalized(record.cardSummary, locale);

  const base = {
    id: record.id,
    name,
    description,
    cardSummary: cardSummary || undefined,
    dimensions: record.dimensions,
    widthCm: record.widthCm,
    heightCm: record.heightCm,
    thicknessCm: record.thicknessCm,
    priceEur: record.priceEur,
    images: (record.images ?? []).filter((url): url is string => typeof url === "string" && url.trim().length > 0),
    customizable: true as const
  };

  if (record.productKind === "giftBox") {
    return { ...base, productKind: "giftBox" } satisfies GiftBoxProduct;
  }

  return {
    ...base,
    productKind: "handbag",
    model: record.model ?? 0,
    pocketsAddOnEur: record.pocketsAddOnEur ?? 20,
    engravingAddOnEur: record.engravingAddOnEur ?? 20
  } satisfies HandbagProduct;
}

export function getCardSummary(record: ProductRecord, locale: Locale): string {
  const summary = pickLocalized(record.cardSummary, locale);
  if (summary) return summary;
  return pickLocalized(record.description, locale).split(/\n+/)[0]?.slice(0, 160) ?? "";
}
