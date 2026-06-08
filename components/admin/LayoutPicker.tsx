"use client";

import { SECTION_LAYOUTS, SECTION_LAYOUT_LABELS, type SectionLayout } from "@/types/content-section";

const layoutPreviewClass: Record<SectionLayout, string> = {
  "split-left": "grid grid-cols-2 gap-1",
  "split-right": "grid grid-cols-2 gap-1",
  centered: "flex flex-col items-center gap-1",
  "full-bleed": "",
  "text-only": "flex flex-col gap-1"
};

export default function LayoutPicker({
  value,
  onChange
}: {
  value: SectionLayout;
  onChange: (layout: SectionLayout) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SECTION_LAYOUTS.map((layout) => {
        const active = value === layout;
        return (
          <button
            key={layout}
            type="button"
            onClick={() => onChange(layout)}
            className={`rounded-2xl border p-4 text-left transition ${
              active
                ? "border-caramel bg-caramel/15 ring-1 ring-caramel/50"
                : "border-ivory/10 bg-black/20 hover:border-caramel/30"
            }`}
          >
            <div className={`relative mb-3 h-16 rounded-lg border border-ivory/10 bg-[#0b0b0b] p-2 ${layoutPreviewClass[layout]}`}>
              {layout === "split-left" ? (
                <>
                  <div className="rounded bg-ivory/20" />
                  <div className="space-y-1">
                    <div className="h-1.5 w-3/4 rounded bg-caramel/60" />
                    <div className="h-1 w-full rounded bg-ivory/15" />
                  </div>
                </>
              ) : null}
              {layout === "split-right" ? (
                <>
                  <div className="space-y-1">
                    <div className="h-1.5 w-3/4 rounded bg-caramel/60" />
                    <div className="h-1 w-full rounded bg-ivory/15" />
                  </div>
                  <div className="rounded bg-ivory/20" />
                </>
              ) : null}
              {layout === "centered" ? (
                <>
                  <div className="h-1.5 w-1/2 rounded bg-caramel/60" />
                  <div className="h-8 w-full rounded bg-ivory/20" />
                </>
              ) : null}
              {layout === "full-bleed" ? (
                <>
                  <div className="absolute inset-2 rounded bg-ivory/20" />
                  <div className="absolute bottom-3 left-3 right-3 h-2 rounded bg-black/50" />
                </>
              ) : null}
              {layout === "text-only" ? (
                <>
                  <div className="h-1.5 w-2/3 rounded bg-caramel/60" />
                  <div className="h-1 w-full rounded bg-ivory/15" />
                  <div className="h-1 w-5/6 rounded bg-ivory/10" />
                </>
              ) : null}
            </div>
            <p className="text-sm font-medium text-ivory">{SECTION_LAYOUT_LABELS[layout].label}</p>
            <p className="mt-1 min-h-[2.5rem] text-xs leading-relaxed text-mist">
              {SECTION_LAYOUT_LABELS[layout].description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
