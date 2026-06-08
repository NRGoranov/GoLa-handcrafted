"use client";

import CraftsmanshipSection from "@/components/CraftsmanshipSection";
import CustomSection from "@/components/CustomSection";
import GallerySection from "@/components/GallerySection";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import { mergeBuiltinSectionCopy } from "@/lib/content/merge-builtin-copy";
import { flattenGalleryImages, type GalleryImageGroup } from "@/lib/galleryTypes";
import { getCopy, type Locale } from "@/lib/i18n";
import type { BuiltinSectionKey } from "@/types/builtin-section";
import { useEffect, useState } from "react";

type BuiltinSectionLivePreviewProps = {
  sectionKey: BuiltinSectionKey;
  content: Record<string, unknown>;
  imageUrl?: string | null;
  locale?: Locale;
  galleryGroups?: GalleryImageGroup[] | null;
  galleryLoading?: boolean;
  interactiveGallery?: boolean;
};

export default function BuiltinSectionLivePreview({
  sectionKey,
  content,
  imageUrl,
  locale = "en",
  galleryGroups: galleryGroupsProp,
  galleryLoading: galleryLoadingProp = false,
  interactiveGallery = false
}: BuiltinSectionLivePreviewProps) {
  const [galleryGroupsLocal, setGalleryGroupsLocal] = useState<GalleryImageGroup[] | null>(null);
  const [galleryLoadingLocal, setGalleryLoadingLocal] = useState(
    sectionKey === "gallery" && galleryGroupsProp === undefined
  );

  const galleryGroups = galleryGroupsProp !== undefined ? galleryGroupsProp : galleryGroupsLocal;
  const galleryLoading =
    galleryGroupsProp !== undefined ? galleryLoadingProp : galleryLoadingLocal;

  useEffect(() => {
    if (sectionKey !== "gallery" || galleryGroupsProp !== undefined) {
      setGalleryGroupsLocal(null);
      setGalleryLoadingLocal(false);
      return;
    }

    let cancelled = false;
    setGalleryLoadingLocal(true);

    void (async () => {
      try {
        const response = await fetch(`/api/admin/gallery?locale=${locale}`, { cache: "no-store" });
        const result = (await response.json()) as {
          ok: boolean;
          groups?: GalleryImageGroup[];
        };
        if (!cancelled && result.ok && result.groups) {
          setGalleryGroupsLocal(result.groups);
        }
      } finally {
        if (!cancelled) setGalleryLoadingLocal(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [galleryGroupsProp, sectionKey, locale]);

  const renderBody = () => {
    switch (sectionKey) {
      case "hero":
        return (
          <Hero
            copy={{
              title: String(content.title ?? ""),
              subtitle: String(content.subtitle ?? ""),
              ctaPrimary: String(content.ctaPrimary ?? ""),
              ctaSecondary: String(content.ctaSecondary ?? ""),
              imageAlt: String(content.imageAlt ?? "")
            }}
          />
        );
      case "craftsmanship":
        return (
          <CraftsmanshipSection
            copy={{
              eyebrow: String(content.eyebrow ?? ""),
              title: String(content.title ?? ""),
              description: String(content.description ?? ""),
              bullets: [
                String((content.bullets as string[] | undefined)?.[0] ?? ""),
                String((content.bullets as string[] | undefined)?.[1] ?? ""),
                String((content.bullets as string[] | undefined)?.[2] ?? "")
              ],
              imageAlt: String(content.imageAlt ?? "")
            }}
            imageUrl={imageUrl}
          />
        );
      case "custom":
        return (
          <CustomSection copy={mergeBuiltinSectionCopy(getCopy(locale).custom, content)} />
        );
      case "gallery": {
        const galleryCopy = mergeBuiltinSectionCopy(getCopy(locale).gallery, content);
        if (galleryLoading) {
          return <p className="p-8 text-center text-sm text-mist">Loading gallery images…</p>;
        }
        if (!galleryGroups || flattenGalleryImages(galleryGroups).length === 0) {
          return (
            <section className="border-y border-ivory/10 bg-ink py-16">
              <div className="container-luxury">
                <SectionHeading
                  eyebrow={String(galleryCopy.eyebrow ?? "")}
                  title={String(galleryCopy.title ?? "")}
                  description={String(galleryCopy.description ?? "")}
                />
                <div className="rounded-xl border border-dashed border-ivory/20 bg-[#111] p-6 text-center">
                  <p className="text-sm text-ivory">No gallery images yet</p>
                  <p className="mt-2 text-xs text-mist">
                    Add gallery sections and upload photos in the editor below.
                  </p>
                </div>
              </div>
            </section>
          );
        }
        return (
          <GallerySection
            copy={galleryCopy}
            groups={galleryGroups}
            containedModal={interactiveGallery}
          />
        );
      }
      case "collection":
      case "giftBox":
        return (
          <section className="border-y border-ivory/10 bg-ink py-16">
            <div className="container-luxury">
              <SectionHeading
                eyebrow={String(content.eyebrow ?? "")}
                title={String(content.title ?? "")}
                description={String(content.description ?? "")}
              />
              {sectionKey === "giftBox" && Array.isArray(content.bullets) ? (
                <ul className="space-y-2 text-sm text-mist">
                  {(content.bullets as string[]).map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {sectionKey === "collection" || sectionKey === "giftBox" ? (
                <p className="mt-6 text-xs text-mist">
                  Product cards preview in the Products tab ({locale}).
                </p>
              ) : null}
            </div>
          </section>
        );
      case "inquiry":
        return (
          <section className="border-y border-ivory/10 bg-ink py-16">
            <div className="container-luxury">
              <SectionHeading
                eyebrow={String(content.eyebrow ?? "")}
                title={String(content.title ?? "")}
                description={String(content.description ?? "")}
              />
              {content.note ? (
                <p className="text-sm text-mist">{String(content.note)}</p>
              ) : null}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return <>{renderBody()}</>;
}
