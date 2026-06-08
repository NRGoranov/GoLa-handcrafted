import { mergeBuiltinSectionCopy } from "@/lib/content/merge-builtin-copy";
import { listBuiltinSections } from "@/lib/content/builtin-section-store";
import { getCopy, type Locale } from "@/lib/i18n";
import type { BuiltinSectionKey } from "@/types/builtin-section";

export async function getSiteCopy(locale: Locale) {
  const base = getCopy(locale);
  const records = await listBuiltinSections();

  const overrides = Object.fromEntries(
    records.map((record) => {
      const content = locale === "en" ? record.contentEn : record.contentBg;
      const key = record.key as BuiltinSectionKey;
      return [key, mergeBuiltinSectionCopy(base[key] as object, content)];
    })
  ) as Partial<typeof base>;

  return { ...base, ...overrides };
}

export async function getBuiltinSectionImageUrl(key: BuiltinSectionKey): Promise<string | null> {
  const records = await listBuiltinSections();
  return records.find((record) => record.key === key)?.imageUrl ?? null;
}
