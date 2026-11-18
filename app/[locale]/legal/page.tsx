import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalChrome from "@/components/LegalChrome";
import { isLocale, type Locale } from "@/lib/i18n";
import { legalCopy } from "@/lib/legal/copy";
import { priceVatIncluded, trader } from "@/lib/legal/trader";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "bg" }];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  return { title: legalCopy[locale].legalTitle };
}

export default async function LegalPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const copy = legalCopy[raw];

  return (
    <LegalChrome locale={raw} path="/legal">
      <p className="text-xs uppercase tracking-[0.16em] text-mist">{copy.updated}</p>
      <h1 className="mt-3 font-serif text-4xl text-ivory">{copy.legalTitle}</h1>
      <dl className="mt-8 space-y-3 text-sm text-mist">
        <Row term={raw === "bg" ? "Марка" : "Brand"} value={trader.brand} />
        <Row term={raw === "bg" ? "Сайт" : "Site"} value={trader.website} />
        <Row term={raw === "bg" ? "Държава" : "Country"} value={trader.established} />
        {trader.legalName ? (
          <Row term={raw === "bg" ? "Правно име" : "Legal name"} value={trader.legalName} />
        ) : null}
        {trader.postalAddress ? (
          <Row term={raw === "bg" ? "Адрес" : "Address"} value={trader.postalAddress} />
        ) : null}
        {trader.email ? <Row term={raw === "bg" ? "Имейл" : "Email"} value={trader.email} /> : null}
        {trader.registryId ? (
          <Row term={raw === "bg" ? "ЕИК" : "Trade register"} value={trader.registryId} />
        ) : null}
        {trader.vatId ? <Row term={raw === "bg" ? "ДДС номер" : "VAT ID"} value={trader.vatId} /> : null}
        <div>
          <dt className="text-ivory">{raw === "bg" ? "Телефони" : "Phones"}</dt>
          <dd className="mt-1">
            {trader.phones.map((phone) => (
              <a key={phone} className="mr-4 underline decoration-caramel/60" href={`tel:${phone}`}>
                {phone}
              </a>
            ))}
          </dd>
        </div>
      </dl>
      {raw === "bg" ? <Bulgarian /> : <English />}
      <p className="mt-8 text-sm">
        <a className="underline decoration-caramel/60" href={`/${raw}/privacy`}>
          {copy.privacyLink}
        </a>
      </p>
    </LegalChrome>
  );
}

function English() {
  const vat =
    priceVatIncluded === true
      ? "The euro amount on each piece includes VAT."
      : priceVatIncluded === false
        ? "VAT is not charged on the prices shown."
        : "The euro amount is the price of the piece. VAT treatment is not printed, because it is not set in the site configuration.";

  return (
    <div className="mt-8 space-y-4 text-sm leading-relaxed text-mist">
      <p>
        This website takes inquiries. It does not take payment and it does not close a sale by itself.{" "}
        {vat} Delivery, if there is any, is quoted before you pay and is not added in silence.
      </p>
      <p>
        If you later buy a finished piece at a distance, you generally have 14 days after delivery to
        withdraw. If a piece is made to your specification, that right can end once you agree and work on
        that personalized piece has started. Which case applies is said before you pay. Consumer goods
        carry a two-year legal guarantee of conformity. Those rights are not waived here.
      </p>
      <p>
        A dispute about a purchase can go to the Consumer Protection Commission (kzp.bg). A dispute about
        personal data can go to the Commission for Personal Data Protection (cpdp.bg).
      </p>
      <p>
        If a part of the site blocks you, call and we will give you the information another way. The build
        target is WCAG 2.2 AA. This is not an audit certificate.
      </p>
    </div>
  );
}

function Bulgarian() {
  const vat =
    priceVatIncluded === true
      ? "Сумата в евро за всяко изделие включва ДДС."
      : priceVatIncluded === false
        ? "Върху показаните цени не се начислява ДДС."
        : "Сумата в евро е цената на изделието. Режим по ДДС не е изписан, защото не е зададен в конфигурацията на сайта.";

  return (
    <div className="mt-8 space-y-4 text-sm leading-relaxed text-mist">
      <p>
        Сайтът приема запитвания. Не приема плащане и сам не сключва продажба. {vat} Доставка, ако има
        такава, се казва преди плащане и не се добавя мълчаливо.
      </p>
      <p>
        Ако по-късно купиш готово изделие от разстояние, по правило имаш 14 дни от доставката, за да се
        откажеш. Ако изделието е изработено по твоя спецификация, това право може да отпадне, след като се
        съгласиш и работата по това персонализирано изделие е започнала. Кой случай важи се казва преди
        плащане. Потребителските стоки имат две години законова гаранция за съответствие. Тези права не се
        отменят тук.
      </p>
      <p>
        Спор за покупка може да отиде в Комисията за защита на потребителите (kzp.bg). Спор за лични данни
        може да отиде в Комисията за защита на личните данни (cpdp.bg).
      </p>
      <p>
        Ако част от сайта ти пречи, обади се и ще дадем информацията по друг начин. Целта на изработката е
        WCAG 2.2 AA. Това не е сертификат от одит.
      </p>
    </div>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-ivory">{term}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
