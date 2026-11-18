import type { Locale } from "@/lib/i18n";
import { priceVatIncluded } from "@/lib/legal/trader";

export function priceCaption(locale: Locale): string {
  if (priceVatIncluded === true) {
    return locale === "bg"
      ? "крайна цена в евро, с включен ДДС. Доставката се казва преди плащане."
      : "final price in euro, VAT included. Delivery is quoted before payment.";
  }
  if (priceVatIncluded === false) {
    return locale === "bg"
      ? "цена в евро, без начислен ДДС. Доставката се казва преди плащане."
      : "price in euro, VAT not charged. Delivery is quoted before payment.";
  }
  return locale === "bg"
    ? "цена на изделието в евро. Доставката се казва преди плащане."
    : "piece price in euro. Delivery is quoted before payment.";
}
