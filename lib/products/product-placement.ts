import type { ContentSection } from "@/types/content-section";
import type { ProductRecordInput } from "@/types/product-record";
import { normalizeCustomizationOptions } from "@/lib/products/customization-options";

export const PLACEMENT_HAND_BAG = "__handbag_collection__";
export const PLACEMENT_GIFT_BOX = "__gift_box__";
export const PLACEMENT_FILTER_ALL = "all";

export type ProductPlacementFilter = typeof PLACEMENT_FILTER_ALL | typeof PLACEMENT_HAND_BAG | typeof PLACEMENT_GIFT_BOX | string;

export function sectionLabel(section: Pick<ContentSection, "slug" | "title">): string {
  const title = section.title.en?.trim() || section.title.bg?.trim();
  const slug = section.slug?.trim();
  if (title && slug) return `${title} (${slug})`;
  return title || slug || "Untitled section";
}

export function sectionPlacementKey(section: Pick<ContentSection, "slug">): string | null {
  const slug = section.slug?.trim();
  return slug || null;
}

export function mergeContentSections(
  primary: ContentSection[],
  secondary: ContentSection[]
): ContentSection[] {
  const map = new Map<string, ContentSection>();
  for (const section of primary) map.set(section.id, section);
  for (const section of secondary) map.set(section.id, section);
  return [...map.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
}

export type PlacementOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function listCmsPlacementOptions(sections: ContentSection[]): PlacementOption[] {
  return mergeContentSections(sections, []).map((section) => {
    const key = sectionPlacementKey(section);
    if (!key) {
      return {
        value: `__missing_slug__${section.id}`,
        label: `${sectionLabel(section)} — set slug in Page sections`,
        disabled: true
      };
    }
    return {
      value: key,
      label: sectionLabel(section)
    };
  });
}

export function productPlacementValue(
  product: Pick<ProductRecordInput, "productKind" | "categorySlug">
): string {
  if (product.productKind === "giftBox") return PLACEMENT_GIFT_BOX;
  if (product.categorySlug?.trim()) return product.categorySlug.trim();
  return PLACEMENT_HAND_BAG;
}

export function applyProductPlacement(product: ProductRecordInput, placement: string): ProductRecordInput {
  if (placement === PLACEMENT_GIFT_BOX) {
    return {
      ...product,
      productKind: "giftBox",
      categorySlug: null,
      model: null,
      pocketsAddOnEur: null,
      engravingAddOnEur: null
    };
  }

  if (placement === PLACEMENT_HAND_BAG) {
    return {
      ...product,
      productKind: "handbag",
      categorySlug: null,
      model: product.model ?? 1,
      pocketsAddOnEur: product.pocketsAddOnEur ?? 20,
      engravingAddOnEur: product.engravingAddOnEur ?? 20
    };
  }

  return {
    ...product,
    productKind: "handbag",
    categorySlug: placement,
    model: product.model ?? 1,
    pocketsAddOnEur: product.pocketsAddOnEur ?? 20,
    engravingAddOnEur: product.engravingAddOnEur ?? 20
  };
}

export function productMatchesPlacementFilter(
  product: Pick<ProductRecordInput, "productKind" | "categorySlug">,
  filter: ProductPlacementFilter
): boolean {
  if (filter === PLACEMENT_FILTER_ALL) return true;
  return productPlacementValue(product) === filter;
}

export function placementLabel(
  product: Pick<ProductRecordInput, "productKind" | "categorySlug">,
  sections: ContentSection[]
): string {
  const value = productPlacementValue(product);
  if (value === PLACEMENT_HAND_BAG) return "Handbag";
  if (value === PLACEMENT_GIFT_BOX) return "Gift box";
  const section = sections.find(
    (entry) => sectionPlacementKey(entry) === value || entry.id === value
  );
  return section ? sectionLabel(section) : value;
}

export function mergeCategoryReorder(
  allSorted: ProductRecordInput[],
  categoryProductIds: Set<string>,
  newCategoryOrder: string[]
): string[] {
  const categoryQueue = [...newCategoryOrder];
  return allSorted.map((product) => {
    if (categoryProductIds.has(product.id)) {
      const nextId = categoryQueue.shift();
      if (!nextId) throw new Error("Invalid product order.");
      return nextId;
    }
    return product.id;
  });
}

export function normalizeProductRecordInput(product: ProductRecordInput): ProductRecordInput {
  return {
    ...product,
    categorySlug: product.categorySlug ?? null,
    customizationOptions: normalizeCustomizationOptions(product.customizationOptions)
  };
}

export function isMainCollectionHandbag(product: {
  productKind: ProductRecordInput["productKind"];
  categorySlug?: string | null;
}): boolean {
  return product.productKind === "handbag" && !(product.categorySlug ?? "").trim();
}

export function productsForSection<T extends { categorySlug?: string | null }>(
  section: Pick<ContentSection, "id" | "slug">,
  products: T[]
): T[] {
  const categoryKey = sectionPlacementKey(section) ?? section.id;
  const normalizedKey = categoryKey.toLowerCase();

  return products.filter((product) => {
    const assigned = (product.categorySlug ?? "").trim();
    if (!assigned) return false;
    return assigned === categoryKey || assigned.toLowerCase() === normalizedKey;
  });
}
