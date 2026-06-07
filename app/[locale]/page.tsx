import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HomeCatalog from "@/components/HomeCatalog";
import GiftBoxSection from "@/components/GiftBoxSection";
import CraftsmanshipSection from "@/components/CraftsmanshipSection";
import GallerySection from "@/components/GallerySection";
import CustomSection from "@/components/CustomSection";
import InquirySection from "@/components/InquirySection";
import DynamicContentSection from "@/components/DynamicContentSection";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { getGalleryGroups } from "@/lib/galleryImages.server";
import { listSections } from "@/lib/content/sections-store";
import { getCopy, isLocale, type Locale } from "@/lib/i18n";
import { isGiftBox, products } from "@/lib/products";

const siteUrl = "https://www.gola-handcrafted.eu";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "bg" }];
}

function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : "en";
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const copy = getCopy(locale);

  return {
    title: copy.seo.homeTitle,
    description: copy.seo.homeDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        bg: "/bg"
      }
    },
    openGraph: {
      title: copy.seo.ogTitle,
      description: copy.seo.ogDescription,
      url: `/${locale}`,
      siteName: "Gola Handcrafted",
      type: "website",
      images: [{ url: "/images/logo.png", width: 1200, height: 630, alt: "Gola Handcrafted logo" }]
    },
    twitter: {
      card: "summary_large_image",
      title: copy.seo.ogTitle,
      description: copy.seo.ogDescription,
      images: ["/images/logo.png"]
    }
  };
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const copy = getCopy(locale);
  const galleryGroups = getGalleryGroups(copy.gallery.groups);
  const dynamicSections = await listSections({ publishedOnly: true });

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/${locale}/#webpage`,
    url: `${siteUrl}/${locale}`,
    name: copy.seo.ogTitle,
    description: copy.seo.homeDescription,
    isPartOf: {
      "@id": `${siteUrl}/#website`
    },
    about: {
      "@id": `${siteUrl}/#organization`
    },
    inLanguage: locale
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: copy.seo.breadcrumbHome,
        item: `${siteUrl}/${locale}`
      }
    ]
  };

  const productsItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images.map((image) => `${siteUrl}${image}`),
        offers: {
          "@type": "Offer",
          price: product.priceEur.toString(),
          priceCurrency: "EUR",
          url: `${siteUrl}/${locale}/${isGiftBox(product) ? "#gift-box" : "#collection"}`
        }
      }
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsItemListJsonLd) }}
      />
      <a href="#main-content" className="focus-ring sr-only focus:not-sr-only">
        Skip to content
      </a>
      <Navbar copy={copy.nav} locale={locale} />
      <main id="main-content">
        <Hero copy={copy.hero} />
        <HomeCatalog locale={locale} copy={{ collection: copy.collection, product: copy.product }} />
        <GiftBoxSection
          locale={locale}
          sectionCopy={copy.giftBox}
          productCopy={copy.product}
          viewDetailsLabel={copy.product.viewDetails}
          viewDetailsAriaTemplate={copy.product.aria.viewDetailsFor}
        />
        <CraftsmanshipSection copy={copy.craftsmanship} />
        <GallerySection copy={copy.gallery} groups={galleryGroups} />
        <CustomSection copy={copy.custom} />
        {dynamicSections.map((section) => (
          <DynamicContentSection key={section.id} section={section} locale={locale} />
        ))}
        <InquirySection copy={copy.inquiry} locale={locale} />
      </main>
      <ScrollToTopButton label={copy.nav.goToTop} />
      <Footer copy={copy.footer} />
    </>
  );
}

