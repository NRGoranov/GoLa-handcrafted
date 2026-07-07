"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ComponentProps } from "react";
import CollectionSection from "@/components/CollectionSection";
import ProductModal from "@/components/ProductModal";
import { getLocalizedProductPreview } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import SectionHeading from "@/components/SectionHeading";
import type { ContentSection } from "@/types/content-section";
import type { Locale } from "@/lib/i18n";

type DynamicContentSectionProps = {
  section: ContentSection;
  locale: Locale;
  products?: Product[];
  /** Optional: used when rendering "product-grid" sections. */
  productModalCopy?: ComponentProps<typeof ProductModal>["copy"];
  giftBoxProduct?: Product | null;
  handbagItems?: Product[];
};

function pickLocalized(section: ContentSection, locale: Locale, field: keyof Pick<
  ContentSection,
  "eyebrow" | "title" | "description" | "body" | "imageAlt" | "ctaLabel" | "highlightTitle" | "highlightBody"
>) {
  const value = section[field];
  if (!value || typeof value !== "object") return "";
  return value[locale]?.trim() || value.en?.trim() || value.bg?.trim() || "";
}

function SectionImage({
  src,
  alt,
  className,
  priority = false
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const normalizedSrc = typeof src === "string" ? src.trim() : "";
  if (!normalizedSrc) return null;

  const isExternal = normalizedSrc.startsWith("http://") || normalizedSrc.startsWith("https://");

  if (isExternal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={normalizedSrc} alt={alt} className={className ?? "h-full w-full object-cover"} loading={priority ? "eager" : "lazy"} />
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      fill
      className={className ?? "object-cover"}
      sizes="(max-width: 768px) 100vw, 50vw"
      loading={priority ? "eager" : "lazy"}
    />
  );
}

function HighlightBox({ title, body }: { title: string; body: string }) {
  if (!title && !body) return null;
  return (
    <div className="mb-6 rounded-2xl border border-caramel/40 bg-caramel/10 p-5" role="note">
      {title ? (
        <p className="text-xs uppercase tracking-[0.16em] text-caramel">{title}</p>
      ) : null}
      {body ? <p className="mt-2 text-sm text-ivory/90">{body}</p> : null}
    </div>
  );
}

function BulletList({ bullets }: { bullets: [string, string, string] | null }) {
  const items = bullets?.filter(Boolean) ?? [];
  if (!items.length) return null;
  return (
    <ul className="space-y-4 text-sm text-mist sm:text-base">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function CtaLink({ label, href }: { label: string; href: string }) {
  const normalizedHref = typeof href === "string" ? href.trim() : "";
  if (!label?.trim() || !normalizedHref) return null;
  const external = normalizedHref.startsWith("http");
  const className =
    "focus-ring mt-8 inline-flex min-h-11 items-center rounded-full border border-caramel/60 px-6 py-3 text-sm font-medium text-caramel transition hover:bg-caramel/10";

  if (external) {
    return (
      <a href={normalizedHref} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={normalizedHref} className={className}>
      {label}
    </Link>
  );
}

export default function DynamicContentSection({
  section,
  locale,
  products = [],
  productModalCopy,
  giftBoxProduct = null,
  handbagItems = []
}: DynamicContentSectionProps) {
  const eyebrow = pickLocalized(section, locale, "eyebrow") ?? "";
  const title = pickLocalized(section, locale, "title") ?? "";
  const description = pickLocalized(section, locale, "description") ?? "";
  const body = pickLocalized(section, locale, "body") ?? "";
  const imageAlt = pickLocalized(section, locale, "imageAlt") || title;
  const ctaLabel = pickLocalized(section, locale, "ctaLabel");
  const highlightTitle = pickLocalized(section, locale, "highlightTitle");
  const highlightBody = pickLocalized(section, locale, "highlightBody");
  const imageUrl = section.imageUrl?.trim() || null;
  const sectionId = section.slug || section.id;
  const isProductGrid = section.layout === "product-grid";

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const productCardCopy = useMemo(
    () => ({
      viewDetails: locale === "bg" ? "Виж детайли" : "View details",
      aria: {
        viewDetailsFor: locale === "bg" ? "Виж детайли за {name}" : "View details for {name}"
      }
    }),
    [locale]
  );

  const giftBoxForModal = useMemo(() => {
    if (!giftBoxProduct) return null;
    if (!productModalCopy) return giftBoxProduct;
    const preview = getLocalizedProductPreview(locale, giftBoxProduct);
    return {
      ...giftBoxProduct,
      name: preview.name,
      description: preview.detailDescription,
      cardSummary: giftBoxProduct.cardSummary?.trim() || preview.cardSummary
    };
  }, [giftBoxProduct, locale, productModalCopy]);

  const filteredProducts = useMemo(() => {
    if (!isProductGrid) return [];
    const categoryKey = (section.slug?.trim() ? section.slug.trim() : section.id).toString();
    return products.filter((product) => (product.categorySlug ?? "").trim() === categoryKey);
  }, [isProductGrid, products, section.id, section.slug]);

  const textBlock = (
    <div>
      <SectionHeading eyebrow={eyebrow || undefined} title={title} description={description || undefined} />
      <HighlightBox title={highlightTitle} body={highlightBody} />
      {body ? <p className="mb-6 text-sm text-mist sm:text-base">{body}</p> : null}
      <BulletList bullets={section.bullets} />
      {section.ctaHref ? <CtaLink label={ctaLabel} href={section.ctaHref} /> : null}
    </div>
  );

  if (section.layout === "text-only") {
    return (
      <section id={sectionId} className="border-y border-ivory/10 bg-[#0f0f0f] py-20 sm:py-24">
        <div className="container-luxury max-w-4xl">{textBlock}</div>
      </section>
    );
  }

  if (section.layout === "product-grid") {
    return (
      <>
        <CollectionSection
          copy={{ eyebrow, title, description }}
          locale={locale}
          productCardCopy={productCardCopy}
          items={filteredProducts}
          sectionId={sectionId}
          onViewProduct={setSelectedProduct}
        />
        {productModalCopy ? (
          <ProductModal
            product={selectedProduct}
            giftBoxProduct={giftBoxForModal}
            handbagItems={handbagItems}
            onClose={() => setSelectedProduct(null)}
            copy={productModalCopy}
          />
        ) : null}
      </>
    );
  }

  if (section.layout === "centered") {
    return (
      <section id={sectionId} className="border-y border-ivory/10 bg-[#0f0f0f] py-20 sm:py-24">
        <div className="container-luxury">
          <SectionHeading
            eyebrow={eyebrow || undefined}
            title={title}
            description={description || undefined}
            align="center"
          />
          <HighlightBox title={highlightTitle} body={highlightBody} />
          {body ? <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-mist sm:text-base">{body}</p> : null}
          {imageUrl ? (
            <div className="relative mx-auto aspect-[16/10] max-w-4xl overflow-hidden rounded-2xl border border-ivory/10">
              <SectionImage src={imageUrl} alt={imageAlt} />
            </div>
          ) : null}
          {section.ctaHref ? (
            <div className="mt-8 text-center">
              <CtaLink label={ctaLabel} href={section.ctaHref} />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (section.layout === "full-bleed") {
    const desc = description.trim();
    const bodyText = body.trim();
    const duplicateCopy = Boolean(desc && bodyText && desc === bodyText);
    const headingDescription = duplicateCopy ? undefined : desc || undefined;
    const overlayBody = duplicateCopy ? desc : bodyText && bodyText !== desc ? bodyText : undefined;

    return (
      <section id={sectionId} className="border-y border-ivory/10 bg-[#0f0f0f] py-20 sm:py-24">
        <div className="container-luxury">
          <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-ivory/10">
            {imageUrl ? (
              <SectionImage src={imageUrl} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[#111]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/55 to-transparent" />
            <div className="relative z-10 flex min-h-[420px] flex-col justify-end p-8 sm:p-12">
              <SectionHeading
                eyebrow={eyebrow || undefined}
                title={title}
                description={headingDescription}
              />
              {overlayBody ? (
                <p className="max-w-2xl text-sm text-mist sm:text-base">{overlayBody}</p>
              ) : null}
              {section.ctaHref ? <CtaLink label={ctaLabel} href={section.ctaHref} /> : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const imageFirst = section.layout === "split-left";

  return (
    <section id={sectionId} className="border-y border-ivory/10 bg-[#0f0f0f] py-20 sm:py-24">
      <div className="container-luxury grid items-center gap-10 md:grid-cols-2">
        {imageFirst && imageUrl ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-ivory/10">
            <SectionImage src={imageUrl} alt={imageAlt} />
          </div>
        ) : null}

        {textBlock}

        {!imageFirst && imageUrl ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-ivory/10">
            <SectionImage src={imageUrl} alt={imageAlt} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
