import type { BuiltinSectionKey } from "@/types/builtin-section";

export type BuiltinFieldType = "text" | "textarea" | "bullets";

export type BuiltinFieldDef = {
  path: string;
  label: string;
  type: BuiltinFieldType;
  locale?: boolean;
};

export const BUILTIN_SECTION_FIELDS: Record<BuiltinSectionKey, BuiltinFieldDef[]> = {
  hero: [
    { path: "title", label: "Headline", type: "text" },
    { path: "subtitle", label: "Subtitle", type: "textarea" },
    { path: "ctaPrimary", label: "Primary button", type: "text" },
    { path: "ctaSecondary", label: "Secondary button", type: "text" },
    { path: "imageAlt", label: "Image alt text", type: "text" }
  ],
  collection: [
    { path: "eyebrow", label: "Eyebrow", type: "text" },
    { path: "title", label: "Title", type: "text" },
    { path: "description", label: "Description", type: "textarea" }
  ],
  giftBox: [
    { path: "eyebrow", label: "Eyebrow", type: "text" },
    { path: "title", label: "Title", type: "text" },
    { path: "description", label: "Description", type: "textarea" },
    { path: "bullets", label: "Bullet points", type: "bullets" },
    { path: "imageAlt", label: "Image alt text", type: "text" }
  ],
  craftsmanship: [
    { path: "eyebrow", label: "Eyebrow", type: "text" },
    { path: "title", label: "Title", type: "text" },
    { path: "description", label: "Description", type: "textarea" },
    { path: "bullets", label: "Bullet points", type: "bullets" },
    { path: "imageAlt", label: "Image alt text", type: "text" }
  ],
  gallery: [
    { path: "eyebrow", label: "Eyebrow", type: "text" },
    { path: "title", label: "Title", type: "text" },
    { path: "description", label: "Description", type: "textarea" }
  ],
  custom: [
    { path: "eyebrow", label: "Eyebrow", type: "text" },
    { path: "title", label: "Title", type: "text" },
    { path: "description", label: "Description", type: "textarea" },
    { path: "highlight.title", label: "Highlight title", type: "text" },
    { path: "highlight.body", label: "Highlight body", type: "textarea" },
    { path: "cards.sizingTitle", label: "Card 1 title", type: "text" },
    { path: "cards.sizingBody", label: "Card 1 body", type: "textarea" },
    { path: "cards.personalizationTitle", label: "Card 2 title", type: "text" },
    { path: "cards.personalizationBody", label: "Card 2 body", type: "textarea" },
    { path: "cards.bespokeTitle", label: "Card 3 title", type: "text" },
    { path: "cards.bespokeBody", label: "Card 3 body", type: "textarea" }
  ],
  inquiry: [
    { path: "eyebrow", label: "Eyebrow", type: "text" },
    { path: "title", label: "Title", type: "text" },
    { path: "description", label: "Description", type: "textarea" },
    { path: "note", label: "Note below form", type: "textarea" }
  ]
};

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const parts = path.split(".");
  const next = { ...obj };
  let cursor: Record<string, unknown> = next;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    const child = cursor[part];
    cursor[part] =
      child && typeof child === "object" && !Array.isArray(child)
        ? { ...(child as Record<string, unknown>) }
        : {};
    cursor = cursor[part] as Record<string, unknown>;
  }

  cursor[parts[parts.length - 1]] = value;
  return next;
}
