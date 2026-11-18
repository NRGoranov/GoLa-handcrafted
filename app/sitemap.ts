import type { MetadataRoute } from "next";

const siteUrl = "https://www.gola-handcrafted.eu";

const legalDocs = ["legal-notice", "privacy", "cookies", "terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["en", "bg"].flatMap((locale) => [
    {
      url: `${siteUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1
    },
    ...legalDocs.map((doc) => ({
      url: `${siteUrl}/${locale}/${doc}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3
    }))
  ]);

  return pages;
}
