import type { BuiltinSectionKey } from "@/types/builtin-section";

export type BuiltinHomeSection = {
  id: string;
  key: BuiltinSectionKey;
  anchor: string;
  title: string;
  description: string;
  productCards?: boolean;
};

/** Fixed homepage blocks — copy stored in builtin_sections, rendered on every visit. */
export const BUILTIN_HOMEPAGE_SECTIONS: BuiltinHomeSection[] = [
  {
    id: "hero",
    key: "hero",
    anchor: "top",
    title: "Hero",
    description: "Full-width intro banner at the top of the page."
  },
  {
    id: "collection",
    key: "collection",
    anchor: "collection",
    title: "Handbag collection",
    description: "Section heading above the product grid.",
    productCards: true
  },
  {
    id: "gift-box",
    key: "giftBox",
    anchor: "gift-box",
    title: "Gift box",
    description: "Gift packaging section with hero image and details.",
    productCards: true
  },
  {
    id: "craftsmanship",
    key: "craftsmanship",
    anchor: "craftsmanship",
    title: "Craftsmanship",
    description: "Story block about materials and making process."
  },
  {
    id: "gallery",
    key: "gallery",
    anchor: "gallery",
    title: "Gallery",
    description: "Photo gallery intro (images from site assets)."
  },
  {
    id: "custom",
    key: "custom",
    anchor: "custom",
    title: "Custom orders",
    description: "Bespoke / custom piece call-to-action section."
  },
  {
    id: "inquiry",
    key: "inquiry",
    anchor: "inquiry",
    title: "Inquiry form",
    description: "Contact and commission request form intro."
  }
];

export const CMS_SECTIONS_INSERT_AFTER = "custom";
