export const SECTION_LAYOUTS = [
  "split-left",
  "split-right",
  "centered",
  "full-bleed",
  "text-only",
  "product-grid"
] as const;

export type SectionLayout = (typeof SECTION_LAYOUTS)[number];

export type LocalizedText = {
  en: string;
  bg: string;
};

export type ContentSection = {
  id: string;
  slug: string;
  layout: SectionLayout;
  sortOrder: number;
  published: boolean;
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  body: LocalizedText;
  bullets: [string, string, string] | null;
  imageUrl: string | null;
  imageAlt: LocalizedText;
  ctaLabel: LocalizedText;
  ctaHref: string | null;
  highlightTitle: LocalizedText;
  highlightBody: LocalizedText;
  createdAt: string;
  updatedAt: string;
};

export type ContentSectionInput = Omit<ContentSection, "id" | "createdAt" | "updatedAt">;

export const SECTION_LAYOUT_LABELS: Record<
  SectionLayout,
  { label: string; description: string }
> = {
  "split-left": {
    label: "Split — image left",
    description: "Image on the left, heading and text on the right."
  },
  "split-right": {
    label: "Split — image right",
    description: "Text on the left, image on the right."
  },
  centered: {
    label: "Centered",
    description: "Centered heading with image below."
  },
  "full-bleed": {
    label: "Full bleed",
    description: "Wide image with title and copy overlaid at the bottom."
  },
  "text-only": {
    label: "Text only",
    description: "Heading and copy without an image."
  },
  "product-grid": {
    label: "Product grid",
    description: "Shows products whose Category matches this section slug."
  }
};
