export const BUILTIN_SECTION_KEYS = [
  "hero",
  "collection",
  "giftBox",
  "craftsmanship",
  "gallery",
  "custom",
  "inquiry"
] as const;

export type BuiltinSectionKey = (typeof BUILTIN_SECTION_KEYS)[number];

export type BuiltinSectionRecord = {
  key: BuiltinSectionKey;
  contentEn: Record<string, unknown>;
  contentBg: Record<string, unknown>;
  imageUrl: string | null;
  updatedAt: string;
};

export function isBuiltinSectionKey(value: string): value is BuiltinSectionKey {
  return (BUILTIN_SECTION_KEYS as readonly string[]).includes(value);
}

export function builtinSelectionId(key: BuiltinSectionKey): string {
  return `builtin-${key}`;
}

export function parseBuiltinSelectionId(id: string | null): BuiltinSectionKey | null {
  if (!id?.startsWith("builtin-")) return null;
  const key = id.slice("builtin-".length);
  return isBuiltinSectionKey(key) ? key : null;
}
