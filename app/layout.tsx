import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
});

const siteUrl = "https://rsg-handcrafted.vercel.app";
const shareTitle = "RSG Handcrafted | Wooden & Leather Handbags";
const shareDescription =
  "Handcrafted wooden and leather handbags with timeless character. Explore limited pieces or request a custom creation.";
const shareImage = "/images/heroRotation/hero-1.jpg";

export const metadata: Metadata = {
  title: shareTitle,
  description: shareDescription,
  keywords: [
    "handcrafted luxury bags",
    "wooden leather handbags",
    "custom artisan bags",
    "bespoke handbag"
  ],
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: siteUrl,
    siteName: "RSG Handcrafted",
    images: [{ url: shareImage, width: 1200, height: 630, alt: "RSG Handcrafted share preview" }],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: [shareImage]
  },
  icons: {
    icon: [
      { url: "/images/logo.png", sizes: "512x512", type: "image/png" },
      { url: "/images/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/images/favicon.ico", type: "image/x-icon" }
    ],
    apple: [{ url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/images/logo.png", "/images/favicon.ico"]
  },
  manifest: "/images/site.webmanifest",
  metadataBase: new URL(siteUrl)
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RSG Handcrafted",
  url: siteUrl,
  logo: `${siteUrl}/images/logo.png`,
  description:
    "Artisan studio creating handcrafted wooden and leather handbags, including custom and personalized requests.",
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "Product",
      name: "Handcrafted Wooden and Leather Handbags",
      category: "Luxury Accessories"
    }
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${manrope.variable}`}>
      <body className="bg-ink text-ivory antialiased">
        <div id="google_translate_element" className="hidden" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            (function () {
              var defaultLanguage = "en";
              var preferredLanguage = ((navigator.language || defaultLanguage).split("-")[0] || defaultLanguage).toLowerCase();

              window.googleTranslateElementInit = function () {
                new google.translate.TranslateElement(
                  {
                    pageLanguage: defaultLanguage,
                    autoDisplay: true
                  },
                  "google_translate_element"
                );

                if (preferredLanguage === defaultLanguage) {
                  return;
                }

                var applyPreferredLanguage = function () {
                  var languageSelector = document.querySelector(".goog-te-combo");

                  if (!languageSelector) {
                    window.setTimeout(applyPreferredLanguage, 300);
                    return;
                  }

                  if (languageSelector.value === preferredLanguage) {
                    return;
                  }

                  languageSelector.value = preferredLanguage;
                  languageSelector.dispatchEvent(new Event("change"));
                };

                window.setTimeout(applyPreferredLanguage, 500);
              };
            })();
          `}
        </Script>
        <Script
          id="google-translate-loader"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
