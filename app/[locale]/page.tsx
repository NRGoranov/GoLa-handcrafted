import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HomePageMain from "@/components/HomePageMain";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { getGalleryGroupsForLocale } from "@/lib/gallery/gallery-store";
import { buildHomepageNavLinks } from "@/lib/content/homepage-nav-links";
import { getResolvedHomepageLayout } from "@/lib/content/homepage-layout-store";
import { listSections } from "@/lib/content/sections-store";
import { getBuiltinSectionImageUrl, getSiteCopy } from "@/lib/content/resolve-site-copy";
import { getCopy, isLocale, type Locale } from "@/lib/i18n";
import { isGiftBox } from "@/lib/products";
import { productRecordToProduct } from "@/lib/products/map-product";
import { listProducts } from "@/lib/products/products-store";

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
  const [copy, craftsmanshipImageUrl, homepageLayout, galleryGroups] = await Promise.all([
    getSiteCopy(locale),
    getBuiltinSectionImageUrl("craftsmanship"),
    getResolvedHomepageLayout(),
    getGalleryGroupsForLocale(locale)
  ]);
  const dynamicSections = await listSections({ publishedOnly: true });
  const productRecords = await listProducts({ publishedOnly: true });
  const products = productRecords.map((record) => productRecordToProduct(record, locale));
  const handbagItems = products.filter((product) => product.productKind === "handbag");
  const giftBoxItem = products.find((product) => product.productKind === "giftBox");
  const navLinks = buildHomepageNavLinks({
    locale,
    layout: homepageLayout,
    sections: dynamicSections
  });

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
      <Navbar copy={copy.nav} locale={locale} links={navLinks} />
      <main id="main-content">
        <HomePageMain
          locale={locale}
          copy={copy}
          layout={homepageLayout}
          craftsmanshipImageUrl={craftsmanshipImageUrl}
          galleryGroups={galleryGroups}
          dynamicSections={dynamicSections}
          handbagItems={handbagItems}
          giftBoxItem={giftBoxItem}
        />
      </main>
      <ScrollToTopButton label={copy.nav.goToTop} />
      <Footer copy={copy.footer} />
    </>
  );
}

