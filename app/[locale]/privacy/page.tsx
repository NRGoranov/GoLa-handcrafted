import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalChrome from "@/components/LegalChrome";
import { isLocale, type Locale } from "@/lib/i18n";
import { legalCopy } from "@/lib/legal/copy";
import { trader } from "@/lib/legal/trader";

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
  return {
    title: legalCopy[locale].privacyTitle,
    robots: { index: true, follow: true }
  };
}

export default async function PrivacyPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const copy = legalCopy[raw];
  const phones = trader.phones.join(raw === "bg" ? " и " : " and ");

  return (
    <LegalChrome locale={raw} path="/privacy">
      <p className="text-xs uppercase tracking-[0.16em] text-mist">{copy.updated}</p>
      <h1 className="mt-3 font-serif text-4xl text-ivory">{copy.privacyTitle}</h1>
      {raw === "bg" ? <Bulgarian phones={phones} /> : <English phones={phones} />}
    </LegalChrome>
  );
}

function English({ phones }: { phones: string }) {
  return (
    <div className="mt-8 space-y-8 text-sm leading-relaxed text-mist">
      <p>
        {trader.brand} is offered from {trader.established}. The published phone numbers are {phones}.
        This notice is the information due when we collect data. It does not waive statutory rights.
      </p>
      <Section title="Inquiries">
        When you send the form, we store and email your name, email, how you want to be reached, the
        topic, the message, and any location or size you add. We use that to answer you. The basis is
        steps you asked for before a possible order (GDPR Art. 6(1)(b)). We do not use an inquiry as
        consent for a newsletter. The record stays until we delete it after the request is finished. A
        copy also sits in the operator mailbox.
      </Section>
      <Section title="Cookies">
        <code>site_locale</code> remembers Bulgarian or English. It is strictly necessary for the
        language you are using, so it does not wait for the banner. <code>gola_visit_counted</code> is
        set for 12 hours only after you accept visit measurement, so one session is not counted on every
        page. It holds no name and no email. Reject stops the count. Product options you pick may be
        kept in this browser so the configuration stays put; that stays on the device.
      </Section>
      <Section title="Who else sees it">
        The site host delivers the pages. Inquiry storage uses Supabase when it is configured, and email
        uses the SMTP service configured on the server, which may be Gmail. Those providers may process
        data outside Bulgaria, including in the United States, under their standard contractual clauses.
        We do not sell inquiry data and we do not use it for advertising.
      </Section>
      <Section title="Rights">
        You can ask for access, correction, deletion, restriction, or a copy, and you can complain to
        the Commission for Personal Data Protection (cpdp.bg) or to the authority where you live in the
        EEA. Call {phones}. We do not make automated decisions that produce legal effects. The site is
        not aimed at children.
      </Section>
    </div>
  );
}

function Bulgarian({ phones }: { phones: string }) {
  return (
    <div className="mt-8 space-y-8 text-sm leading-relaxed text-mist">
      <p>
        {trader.brand} се предлага от {trader.established === "Bulgaria" ? "България" : trader.established}.
        Публичните телефони са {phones}. Това е информацията, която дължим при събиране на данни. Тя не
        отменя законови права.
      </p>
      <Section title="Запитвания">
        Когато изпратиш формата, пазим и изпращаме по имейл името, имейла, начина за връзка, темата,
        съобщението и локацията или размера, ако си ги добавил. Ползваме ги, за да отговорим. Основанието
        е стъпки преди евентуална поръчка, които ти поиска (чл. 6, §1, б. „б“ от GDPR). Запитването не е
        съгласие за бюлетин. Записът стои, докато го изтрием след приключване. Копие остава и в пощенската
        кутия на оператора.
      </Section>
      <Section title="Бисквитки">
        <code>site_locale</code> помни български или английски. Тя е необходима за избрания език и не чака
        банера. <code>gola_visit_counted</code> се слага за 12 часа само след като приемеш броенето на
        посещения, за да не броим една сесия на всяка страница. В нея няма име и няма имейл. Отказът спира
        броенето. Избраните опции по изделие могат да останат в браузъра, за да се запази конфигурацията.
        Те не напускат устройството.
      </Section>
      <Section title="Кой още ги вижда">
        Хостът на сайта доставя страниците. Запитванията се пазят в Supabase, когато е включен, а имейлът
        минава през SMTP услугата на сървъра, която може да е Gmail. Тези доставчици могат да обработват
        данни извън България, включително в САЩ, по стандартните им договорни клаузи. Не продаваме
        запитванията и не ги ползваме за реклама.
      </Section>
      <Section title="Права">
        Можеш да поискаш достъп, поправка, изтриване, ограничаване или копие, и да подадеш жалба до
        Комисията за защита на личните данни (cpdp.bg) или до органа в държавата от ЕИП, в която живееш.
        Обади се на {phones}. Не вземаме автоматизирани решения с правни последици. Сайтът не е насочен
        към деца.
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl text-ivory">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
