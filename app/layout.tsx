import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-playfair",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-manrope",
  display: "swap"
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500"]
});

const siteUrl = "https://www.gola-handcrafted.eu";
const shareTitle = "Gola Handcrafted | Premium Wood & Leather Handbags";
const shareDescription =
  "Gola Handcrafted creates premium handcrafted handbags combining natural wood, leather, and refined artisan design for distinctive, elegant everyday accessories.";
const shareImage = "/images/logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: shareTitle,
    template: "%s | Gola Handcrafted"
  },
  description: shareDescription,
  keywords: [
    "handcrafted handbags",
    "wooden handbags",
    "leather handbags",
    "handcrafted leather bags",
    "luxury handcrafted handbags",
    "artisan handbags",
    "premium handmade bags",
    "wood and leather handbags",
    "unique designer handbags",
    "handmade luxury accessories"
  ],
  authors: [{ name: "Gola Handcrafted" }],
  creator: "Gola Handcrafted",
  publisher: "Gola Handcrafted",
  category: "fashion accessories",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: "/",
    siteName: "Gola Handcrafted",
    images: [{ url: shareImage, width: 1200, height: 630, alt: "Gola Handcrafted share preview" }],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: [shareImage]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: [
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon.ico", type: "image/x-icon" }
    ],
    apple: [{ url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/images/favicon.ico"]
  },
  manifest: "/images/site.webmanifest"
};

// TODO: Add Google Search Console and Bing Webmaster verification tokens when available.
// TODO: Add public business email, location, and social profile links when available.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "Gola Handcrafted",
  url: siteUrl,
  logo: `${siteUrl}/images/logo.png`,
  description: shareDescription,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+359887509906",
      areaServed: "EU",
      availableLanguage: "en"
    },
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+359887297480",
      areaServed: "EU",
      availableLanguage: "en"
    }
  ]
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: "Gola Handcrafted",
  publisher: {
    "@id": `${siteUrl}/#organization`
  },
  inLanguage: "en"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = cookies().get("site_locale")?.value === "bg" ? "bg" : "en";

  return (
    <html
      lang={locale}
      data-hero-passed="false"
      className={`${playfair.variable} ${manrope.variable} ${cormorantGaramond.variable}`}
    >
      <body className="bg-ink text-ivory antialiased">
        <div id="google_translate_element" className="hidden" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* <TranslatePrompt /> */}
        {children}
      </body>
    </html>
  );
}
