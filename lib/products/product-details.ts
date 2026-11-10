import { getCopy, type Locale } from "@/lib/i18n";
import type {
  DisplayProductDetail,
  LocalizedText,
  ProductDetail,
  ProductDetailBinding,
  ProductKind
} from "@/types/product-record";

/** Original wooden handbags that are lined in natural leather. */
const LEATHER_HANDBAG_IDS = new Set(["model-1", "model-2", "model-3", "model-4"]);

const BINDINGS = new Set<ProductDetailBinding>([
  "model",
  "dimensions",
  "price",
  "availability",
  "customization"
]);

export const PRODUCT_DETAILS_COLUMN_SQL =
  "alter table public.products add column if not exists details jsonb;";

type DetailProduct = {
  id: string;
  productKind: ProductKind;
  details?: ProductDetail[] | null;
};

function emptyText(): LocalizedText {
  return { en: "", bg: "" };
}

function asLocalized(value: unknown): LocalizedText {
  if (!value || typeof value !== "object") return emptyText();
  const row = value as Record<string, unknown>;
  return {
    en: typeof row.en === "string" ? row.en : "",
    bg: typeof row.bg === "string" ? row.bg : ""
  };
}

export function isClassicLeatherHandbag(productId: string): boolean {
  return LEATHER_HANDBAG_IDS.has(productId);
}

export function normalizeStoredDetails(raw: unknown): ProductDetail[] | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return normalizeStoredDetails(JSON.parse(raw) as unknown);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(raw)) return null;

  const seen = new Set<string>();
  const details: ProductDetail[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id.trim() : "";
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const binding =
      typeof row.binding === "string" && BINDINGS.has(row.binding as ProductDetailBinding)
        ? (row.binding as ProductDetailBinding)
        : null;
    details.push({
      id,
      label: asLocalized(row.label),
      value: asLocalized(row.value),
      visible: row.visible !== false,
      binding
    });
  }
  return details;
}

function boundDetail(
  id: ProductDetailBinding,
  enLabel: string,
  bgLabel: string
): ProductDetail {
  return {
    id,
    binding: id,
    label: { en: enLabel, bg: bgLabel },
    value: emptyText(),
    visible: true
  };
}

export function buildDefaultProductDetails(product: {
  id: string;
  productKind: ProductKind;
}): ProductDetail[] {
  const en = getCopy("en").product;
  const bg = getCopy("bg").product;
  const rows: ProductDetail[] = [];

  if (product.productKind === "handbag") {
    rows.push(boundDetail("model", en.labels.model, bg.labels.model));
  }
  rows.push(boundDetail("dimensions", en.labels.dimensions, bg.labels.dimensions));
  rows.push(boundDetail("price", en.labels.price, bg.labels.price));
  rows.push(boundDetail("availability", en.labels.availability, bg.labels.availability));
  rows.push(boundDetail("customization", en.labels.customization, bg.labels.customization));

  if (product.productKind === "handbag" && isClassicLeatherHandbag(product.id)) {
    rows.push({
      id: "inside-material",
      binding: null,
      visible: true,
      label: { en: en.labels.inside, bg: bg.labels.inside },
      value: { en: en.values.insideLeather, bg: bg.values.insideLeather }
    });
  }

  return rows;
}

export function insideMaterialDetail(productId: string): ProductDetail {
  const fromDefaults = buildDefaultProductDetails({
    id: productId,
    productKind: "handbag"
  }).find((detail) => detail.id === "inside-material");
  if (fromDefaults) return fromDefaults;

  const en = getCopy("en").product;
  const bg = getCopy("bg").product;
  return {
    id: "inside-material",
    binding: null,
    visible: true,
    label: { en: en.labels.inside, bg: bg.labels.inside },
    value: emptyText()
  };
}

export function effectiveProductDetails(product: DetailProduct): ProductDetail[] {
  if (Array.isArray(product.details)) return product.details;
  return buildDefaultProductDetails(product);
}

export function cloneProductDetails(details: ProductDetail[]): ProductDetail[] {
  return details.map((detail) => ({
    ...detail,
    label: { ...detail.label },
    value: { ...detail.value }
  }));
}

function pickLocalized(text: LocalizedText, locale: Locale): string {
  const primary = text[locale]?.trim();
  if (primary) return text[locale];
  const fallback = locale === "en" ? text.bg : text.en;
  return fallback?.trim() ? fallback : "";
}

export function localizeProductDetails(
  details: ProductDetail[] | null | undefined,
  product: { id: string; productKind: ProductKind },
  locale: Locale
): DisplayProductDetail[] {
  const source = Array.isArray(details) ? details : buildDefaultProductDetails(product);
  return source.map((detail) => ({
    id: detail.id,
    label: pickLocalized(detail.label, locale),
    value: pickLocalized(detail.value, locale),
    visible: detail.visible !== false,
    binding: detail.binding
  }));
}

export type PublicDetailRow = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export function resolvePublicDetailRows(args: {
  details: DisplayProductDetail[];
  productKind: ProductKind;
  model: number | null;
  customizable: boolean;
  displayPrice: number;
  displayDimensions: string;
  labels: {
    model: string;
    dimensions: string;
    dimensionsHint: string;
    price: string;
    availability: string;
    customization: string;
  };
  values: {
    availabilityByInquiry: string;
    customizationYes: string;
    customizationNo: string;
  };
}): PublicDetailRow[] {
  const rows: PublicDetailRow[] = [];

  for (const detail of args.details) {
    if (!detail.visible) continue;

    let value = detail.value.trim();
    let hint: string | undefined;
    const fallbackLabel = detail.binding ? boundLabel(detail.binding, args.labels) : "";
    const label = detail.label.trim() || fallbackLabel;

    if (detail.binding === "model") {
      if (args.productKind !== "handbag" || args.model == null || args.model <= 0) continue;
      value = String(args.model);
    } else if (detail.binding === "dimensions") {
      value = args.displayDimensions.trim();
      hint = args.labels.dimensionsHint;
    } else if (detail.binding === "price") {
      value = `EUR ${args.displayPrice}`;
    } else if (detail.binding === "availability") {
      value = args.values.availabilityByInquiry;
    } else if (detail.binding === "customization") {
      value = args.customizable ? args.values.customizationYes : args.values.customizationNo;
    }

    if (!label && !value) continue;
    rows.push({ id: detail.id, label, value, hint });
  }

  return rows;
}

function boundLabel(
  binding: ProductDetailBinding,
  labels: {
    model: string;
    dimensions: string;
    price: string;
    availability: string;
    customization: string;
  }
): string {
  if (binding === "model") return labels.model;
  if (binding === "dimensions") return labels.dimensions;
  if (binding === "price") return labels.price;
  if (binding === "availability") return labels.availability;
  return labels.customization;
}

export function boundValuePreview(
  binding: ProductDetailBinding,
  locale: Locale,
  snapshot: { model: number | null; dimensions: string; priceEur: number }
): string {
  const copy = getCopy(locale).product;
  if (binding === "model") return snapshot.model && snapshot.model > 0 ? String(snapshot.model) : "";
  if (binding === "dimensions") return snapshot.dimensions;
  if (binding === "price") return `EUR ${snapshot.priceEur}`;
  if (binding === "availability") return copy.values.availabilityByInquiry;
  return copy.values.customizationYes;
}

export function detachProductDetail(
  detail: ProductDetail,
  snapshot: { model: number | null; dimensions: string; priceEur: number }
): ProductDetail {
  if (!detail.binding) return detail;
  return {
    ...detail,
    binding: null,
    value: {
      en: boundValuePreview(detail.binding, "en", snapshot),
      bg: boundValuePreview(detail.binding, "bg", snapshot)
    }
  };
}

export function detailsMatchAutomatic(
  details: ProductDetail[] | null | undefined,
  product: { id: string; productKind: ProductKind }
): boolean {
  if (details == null) return true;
  return JSON.stringify(details) === JSON.stringify(buildDefaultProductDetails(product));
}

export function createCustomProductDetail(): ProductDetail {
  return {
    id: `detail-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    binding: null,
    visible: true,
    label: emptyText(),
    value: emptyText()
  };
}

export function moveProductDetail(
  details: ProductDetail[],
  id: string,
  direction: -1 | 1
): ProductDetail[] {
  const current = details.find((detail) => detail.id === id);
  if (!current) return details;
  const group = details.filter((detail) => detail.visible === current.visible);
  const index = group.findIndex((detail) => detail.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= group.length) return details;
  const nextGroup = [...group];
  [nextGroup[index], nextGroup[target]] = [nextGroup[target], nextGroup[index]];
  let cursor = 0;
  return details.map((detail) =>
    detail.visible === current.visible ? nextGroup[cursor++] : detail
  );
}
