import { getCopy, type Locale } from "@/lib/i18n";
import { parseBuiltinSelectionId, type BuiltinSectionKey } from "@/types/builtin-section";
import type { ContentSection } from "@/types/content-section";
import type { HomepageBlockId } from "@/types/homepage-layout";

export type HomepageNavLink = {
  href: string;
  label: string;
};

const BUILTIN_NAV: Partial<
  Record<BuiltinSectionKey, { href: string; linkKey: keyof ReturnType<typeof getCopy>["nav"]["links"] }>
> = {
  collection: { href: "#collection", linkKey: "collection" },
  giftBox: { href: "#gift-box", linkKey: "giftBox" },
  craftsmanship: { href: "#craftsmanship", linkKey: "craftsmanship" },
  gallery: { href: "#gallery", linkKey: "gallery" },
  custom: { href: "#custom", linkKey: "custom" },
  inquiry: { href: "#inquiry", linkKey: "inquiry" }
};

function localizedSectionTitle(section: ContentSection, locale: Locale): string {
  return section.title[locale]?.trim() || section.title.en?.trim() || section.title.bg?.trim() || section.slug;
}

export function buildHomepageNavLinks(options: {
  locale: Locale;
  layout: HomepageBlockId[];
  sections: ContentSection[];
  includeUnpublished?: boolean;
}): HomepageNavLink[] {
  const { locale, layout, sections, includeUnpublished = false } = options;
  const navLinks = getCopy(locale).nav.links;
  const sectionMap = new Map(sections.map((section) => [section.id, section]));
  const links: HomepageNavLink[] = [];
  const seen = new Set<string>();

  for (const blockId of layout) {
    const builtinKey = parseBuiltinSelectionId(blockId);
    if (builtinKey) {
      const builtin = BUILTIN_NAV[builtinKey];
      if (!builtin || seen.has(builtin.href)) continue;
      links.push({ href: builtin.href, label: navLinks[builtin.linkKey] });
      seen.add(builtin.href);
      continue;
    }

    const section = sectionMap.get(blockId);
    if (!section) continue;
    if (!includeUnpublished && !section.published) continue;

    const href = `#${section.slug || section.id}`;
    if (seen.has(href)) continue;

    const label = localizedSectionTitle(section, locale);
    if (!label) continue;

    links.push({ href, label });
    seen.add(href);
  }

  return links;
}
