import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalDocumentView from "@/components/LegalDocumentView";
import { getLegalDocument, isLegalDoc } from "@/lib/legal/copy";
import { isLocale, locales, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    (["privacy", "cookies", "legal-notice", "terms"] as const).map((doc) => ({ locale, doc }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; doc: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, doc } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  if (!isLegalDoc(doc)) return { title: "Legal" };
  const document = getLegalDocument(locale, doc);
  return {
    title: document.title,
    description: document.description,
    alternates: {
      canonical: `/${locale}/${doc}`,
      languages: {
        en: `/en/${doc}`,
        bg: `/bg/${doc}`
      }
    }
  };
}

export default async function LegalPage({
  params
}: {
  params: Promise<{ locale: string; doc: string }>;
}) {
  const { locale: rawLocale, doc } = await params;
  if (!isLocale(rawLocale) || !isLegalDoc(doc)) notFound();
  const document = getLegalDocument(rawLocale, doc);
  return <LegalDocumentView locale={rawLocale} document={document} />;
}
