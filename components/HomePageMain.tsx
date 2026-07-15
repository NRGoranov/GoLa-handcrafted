import CraftsmanshipSection from "@/components/CraftsmanshipSection";
import CustomSection from "@/components/CustomSection";
import DynamicContentSection from "@/components/DynamicContentSection";
import GallerySection from "@/components/GallerySection";
import GiftBoxSection from "@/components/GiftBoxSection";
import Hero from "@/components/Hero";
import HomeCatalog from "@/components/HomeCatalog";
import InquirySection from "@/components/InquirySection";
import type { getSiteCopy } from "@/lib/content/resolve-site-copy";
import type { GalleryImageGroup } from "@/lib/galleryTypes";
import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import { parseBuiltinSelectionId } from "@/types/builtin-section";
import type { ContentSection } from "@/types/content-section";
import type { HomepageBlockId } from "@/types/homepage-layout";

type HomePageMainProps = {
  locale: Locale;
  copy: Awaited<ReturnType<typeof getSiteCopy>>;
  layout: HomepageBlockId[];
  craftsmanshipImageUrl: string | null;
  galleryGroups: GalleryImageGroup[];
  dynamicSections: ContentSection[];
  products: Product[];
  handbagItems: Product[];
  earringItems?: Product[];
  giftBoxItem?: Product;
};

export default function HomePageMain({
  locale,
  copy,
  layout,
  craftsmanshipImageUrl,
  galleryGroups,
  dynamicSections,
  products,
  handbagItems,
  earringItems = [],
  giftBoxItem
}: HomePageMainProps) {
  const sectionMap = new Map(dynamicSections.map((section) => [section.id, section]));

  return (
    <>
      {layout.map((blockId) => {
        const builtinKey = parseBuiltinSelectionId(blockId);
        if (builtinKey) {
          switch (builtinKey) {
            case "hero":
              return <Hero key={blockId} copy={copy.hero} />;
            case "collection":
              return (
                <HomeCatalog
                  key={blockId}
                  locale={locale}
                  copy={{ collection: copy.collection, product: copy.product }}
                  items={handbagItems}
                  giftBoxProduct={giftBoxItem ?? null}
                />
              );
            case "giftBox":
              return giftBoxItem ? (
                <GiftBoxSection
                  key={blockId}
                  locale={locale}
                  product={giftBoxItem}
                  handbagItems={handbagItems}
                  earringItems={earringItems}
                  sectionCopy={copy.giftBox}
                  productCopy={copy.product}
                  viewDetailsLabel={copy.product.viewDetails}
                  viewDetailsAriaTemplate={copy.product.aria.viewDetailsFor}
                />
              ) : null;
            case "craftsmanship":
              return (
                <CraftsmanshipSection
                  key={blockId}
                  copy={copy.craftsmanship}
                  imageUrl={craftsmanshipImageUrl}
                />
              );
            case "gallery":
              return <GallerySection key={blockId} copy={copy.gallery} groups={galleryGroups} />;
            case "custom":
              return <CustomSection key={blockId} copy={copy.custom} />;
            case "inquiry":
              return <InquirySection key={blockId} copy={copy.inquiry} locale={locale} />;
            default:
              return null;
          }
        }

        const section = sectionMap.get(blockId);
        if (!section) return null;
        return (
          <DynamicContentSection
            key={blockId}
            section={section}
            locale={locale}
            products={products}
            productModalCopy={copy.product}
            giftBoxProduct={giftBoxItem ?? null}
            handbagItems={handbagItems}
          />
        );
      })}
    </>
  );
}
