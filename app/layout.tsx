import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Playfair_Display } from "next/font/google";
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

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500"]
});

const siteUrl = "https://gola-handcrafted.vercel.app";
const shareTitle = "GoLa Handcrafted | Wooden & Leather Handbags";
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
    siteName: "GoLa Handcrafted",
    images: [{ url: shareImage, width: 1200, height: 630, alt: "GoLa Handcrafted share preview" }],
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
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon.ico", type: "image/x-icon" }
    ],
    apple: [{ url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/images/favicon.ico"]
  },
  manifest: "/images/site.webmanifest",
  metadataBase: new URL(siteUrl)
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GoLa Handcrafted",
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
    <html
      lang="en"
      className={`${playfair.variable} ${manrope.variable} ${cormorantGaramond.variable}`}
    >
      <body className="bg-ink text-ivory antialiased">
        <div id="google_translate_element" className="hidden" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* <TranslatePrompt /> */}
        {children}
      </body>
    </html>
  );
}
