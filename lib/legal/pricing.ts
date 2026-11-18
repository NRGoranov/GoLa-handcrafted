import type { Locale } from "@/lib/i18n";
import { pricesIncludeVat } from "@/lib/legal/operator";

/** Short label placed next to a consumer price. Null when VAT treatment is not configured. */
export function vatPriceSuffix(locale: Locale): string | null {
  const included = pricesIncludeVat();
  if (included === true) return locale === "bg" ? "с ДДС" : "incl. VAT";
  if (included === false) return locale === "bg" ? "без начислен ДДС" : "VAT not charged";
  return null;
}

export function formatEur(amount: number, locale: Locale): string {
  const suffix = vatPriceSuffix(locale);
  const base = `EUR ${amount}`;
  return suffix ? `${base} ${suffix}` : base;
}
