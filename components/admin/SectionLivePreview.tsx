"use client";

import DynamicContentSection from "@/components/DynamicContentSection";
import type { ContentSection } from "@/types/content-section";
import type { Locale } from "@/lib/i18n";

export default function SectionLivePreview({
  section,
  locale = "en"
}: {
  section: ContentSection;
  locale?: Locale;
}) {
  return <DynamicContentSection section={section} locale={locale} />;
}
