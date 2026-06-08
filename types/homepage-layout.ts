import { builtinSelectionId } from "@/types/builtin-section";
import { BUILTIN_HOMEPAGE_SECTIONS, CMS_SECTIONS_INSERT_AFTER } from "@/lib/content/builtin-sections";

export type HomepageBlockId = string;

export function buildDefaultHomepageLayout(cmsSectionIds: string[]): HomepageBlockId[] {
  const builtins = BUILTIN_HOMEPAGE_SECTIONS.map((section) => builtinSelectionId(section.key));
  const insertIndex = BUILTIN_HOMEPAGE_SECTIONS.findIndex((section) => section.id === CMS_SECTIONS_INSERT_AFTER);
  const splitAt = insertIndex === -1 ? builtins.length : insertIndex + 1;

  return [...builtins.slice(0, splitAt), ...cmsSectionIds, ...builtins.slice(splitAt)];
}

export function normalizeHomepageLayout(
  saved: HomepageBlockId[] | null | undefined,
  cmsSectionIds: string[]
): HomepageBlockId[] {
  const defaultLayout = buildDefaultHomepageLayout(cmsSectionIds);
  const validBuiltinIds = new Set(
    BUILTIN_HOMEPAGE_SECTIONS.map((section) => builtinSelectionId(section.key))
  );
  const validCmsIds = new Set(cmsSectionIds);

  const normalized: HomepageBlockId[] = [];
  const seen = new Set<string>();

  for (const blockId of saved ?? []) {
    if (seen.has(blockId)) continue;
    if (!validBuiltinIds.has(blockId) && !validCmsIds.has(blockId)) continue;
    normalized.push(blockId);
    seen.add(blockId);
  }

  for (const blockId of defaultLayout) {
    if (!seen.has(blockId)) {
      normalized.push(blockId);
      seen.add(blockId);
    }
  }

  return normalized;
}

export function isValidHomepageLayout(
  blockOrder: HomepageBlockId[],
  cmsSectionIds: string[]
): boolean {
  const expected = new Set(buildDefaultHomepageLayout(cmsSectionIds));
  if (blockOrder.length !== expected.size) return false;
  const seen = new Set<string>();
  for (const blockId of blockOrder) {
    if (!expected.has(blockId) || seen.has(blockId)) return false;
    seen.add(blockId);
  }
  return true;
}
