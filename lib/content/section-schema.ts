import { z } from "zod";
import { SECTION_LAYOUTS, type ContentSection } from "@/types/content-section";

const localizedSchema = z.object({
  en: z.string(),
  bg: z.string()
});

export const contentSectionInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  layout: z.enum(SECTION_LAYOUTS),
  sortOrder: z.number().int().min(0),
  published: z.boolean(),
  eyebrow: localizedSchema,
  title: localizedSchema.refine((value) => value.en.trim() || value.bg.trim(), {
    message: "Title is required in at least one language."
  }),
  description: localizedSchema,
  body: localizedSchema,
  bullets: z.tuple([z.string(), z.string(), z.string()]).nullable(),
  imageUrl: z.string().nullable(),
  imageAlt: localizedSchema,
  ctaLabel: localizedSchema,
  ctaHref: z.string().nullable(),
  highlightTitle: localizedSchema,
  highlightBody: localizedSchema
});

export type ContentSectionFormValues = z.infer<typeof contentSectionInputSchema>;

export function formValuesToInput(values: ContentSectionFormValues) {
  return {
    ...values,
    slug: values.slug.trim(),
    imageUrl: values.imageUrl?.trim() || null,
    ctaHref: values.ctaHref?.trim() || null
  };
}

export function formValuesToPreviewSection(
  values: ContentSectionFormValues,
  section: Pick<ContentSection, "id" | "createdAt" | "updatedAt">
): ContentSection {
  return {
    id: section.id,
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
    ...formValuesToInput(values)
  };
}

export function sectionToInput(section: ContentSection) {
  const { id, createdAt, updatedAt, ...input } = section;
  void id;
  void createdAt;
  void updatedAt;
  return input;
}

export function sectionToFormValues(section: {
  slug: string;
  layout: ContentSectionFormValues["layout"];
  sortOrder: number;
  published: boolean;
  eyebrow: { en: string; bg: string };
  title: { en: string; bg: string };
  description: { en: string; bg: string };
  body: { en: string; bg: string };
  bullets: [string, string, string] | null;
  imageUrl: string | null;
  imageAlt: { en: string; bg: string };
  ctaLabel: { en: string; bg: string };
  ctaHref: string | null;
  highlightTitle: { en: string; bg: string };
  highlightBody: { en: string; bg: string };
}): ContentSectionFormValues {
  return {
    slug: section.slug,
    layout: section.layout,
    sortOrder: section.sortOrder,
    published: section.published,
    eyebrow: section.eyebrow,
    title: section.title,
    description: section.description,
    body: section.body,
    bullets: section.bullets,
    imageUrl: section.imageUrl,
    imageAlt: section.imageAlt,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
    highlightTitle: section.highlightTitle,
    highlightBody: section.highlightBody
  };
}
