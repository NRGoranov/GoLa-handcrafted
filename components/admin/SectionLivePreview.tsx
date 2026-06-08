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
  return (
    <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ink shadow-2xl">
      <div className="border-b border-ivory/10 bg-[#111] px-4 py-2 text-xs uppercase tracking-[0.16em] text-mist">
        Live preview · {section.published ? "Published" : "Draft"}
      </div>
      <div className="pointer-events-none max-h-[min(70vh,720px)] overflow-y-auto">
        <DynamicContentSection section={section} locale={locale} />
      </div>
    </div>
  );
}
