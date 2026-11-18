import type { Locale } from "@/lib/i18n";
import {
  getOperator,
  missingIdentityFields,
  type IdentityGap,
  type OperatorProfile
} from "@/lib/legal/operator";

export const legalDocs = ["privacy", "cookies", "legal-notice", "terms"] as const;
export type LegalDoc = (typeof legalDocs)[number];

export function isLegalDoc(value: string): value is LegalDoc {
  return (legalDocs as readonly string[]).includes(value);
}

export type LegalSection = {
  id?: string;
  heading: string;
  paragraphs: string[];
  items?: string[];
};

export type LegalDocument = {
  title: string;
  description: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

function updatedOn(locale: Locale): string {
  return locale === "bg" ? "18 ноември 2026" : "18 November 2026";
}

const gapLabels: Record<Locale, Record<IdentityGap, string>> = {
  en: {
    legalName: "legal name of the trader",
    address: "geographic address of the establishment",
    uic: "trade-register number (EIK / BULSTAT or the equivalent)",
    email: "contact email address"
  },
  bg: {
    legalName: "правното име на търговеца",
    address: "географският адрес на установяване",
    uic: "номерът в търговския регистър (ЕИК / БУЛСТАТ или еквивалент)",
    email: "имейл за контакт"
  }
};

function vatParagraph(locale: Locale, included: boolean | null): string {
  if (locale === "bg") {
    if (included === true) {
      return "Цените в евро на сайта са крайни потребителски цени и включват ДДС.";
    }
    if (included === false) {
      return "Цените в евро на сайта са крайната сума за изделието. ДДС не се начислява. Това важи само ако търговецът не е регистриран по ЗДДС или конкретната доставка не се облага. Не добавяме ДДС върху показаната цена.";
    }
    return "Цените са в евро. Все още не е посочено дали включват ДДС. Сумата, която дължите, е тази, която потвърдим преди плащане.";
  }

  if (included === true) {
    return "Euro prices on this site are the total consumer price and include VAT.";
  }
  if (included === false) {
    return "Euro prices on this site are the total amount for the piece. VAT is not charged on top. Use this setting only when the trader is not VAT-registered, or the supply is not taxable. We do not add VAT to the figure shown.";
  }
  return "Prices are in euro. Whether those amounts include VAT is not stated on this site yet. The amount you owe is the amount we confirm before you pay.";
}

function identityParagraph(locale: Locale, operator: OperatorProfile): string {
  const gaps = missingIdentityFields(operator);
  if (gaps.length === 0) {
    return locale === "bg"
      ? "Идентификацията на търговеца е попълнена от конфигурацията на сайта и е показана по-долу."
      : "The trader identification below is filled from the site configuration.";
  }

  const list = gaps.map((gap) => gapLabels[locale][gap]).join(", ");
  return locale === "bg"
    ? `Все още не са публикувани: ${list}. Телефоните по-долу са реалните публични номера. Липсващите данни не се заместват с измислени.`
    : `Not yet published: ${list}. The phone numbers below are the real public numbers. Missing data is left blank rather than invented.`;
}

function privacy(locale: Locale, operator: OperatorProfile): LegalDocument {
  const email = operator.email ?? (locale === "bg" ? "имейлът от правната информация, след като бъде публикуван" : "the email on the legal notice, once it is published");
  if (locale === "bg") {
    return {
      title: "Поверителност",
      description: "Какво прави GoLa Handcrafted с личните данни от сайта и запитванията.",
      updated: updatedOn(locale),
      intro: identityParagraph(locale, operator),
      sections: [
        {
          heading: "Кой отговаря за данните",
          paragraphs: [
            `${operator.tradeName} определя целите на данните, събрани през ${operator.siteUrl}. Правното име, седалището и имейлът са на страницата „Правна информация“, доколкото са въведени в конфигурацията.`,
            "Няма назначено длъжностно лице по защита на данните. За достъп, корекция или изтриване пишете на публикувания имейл или на телефоните на сайта."
          ]
        },
        {
          heading: "Какво събираме и защо",
          paragraphs: [
            "Формата за запитване събира име, имейл, начин за контакт, тип на запитването, съобщение и по желание локация и размер. Правно основание е чл. 6, §1, б. „б“ от GDPR: стъпки преди договор по ваше искане. Съобщението се пази в базата на сайта, когато Supabase е конфигуриран, и се изпраща по имейл до ателието и като копие до вас.",
            "Броячът на посещения пази само сборни числа (общо, за деня, за 7 дни) и часа на последното отчитане. Не записваме IP адрес, не пазим история по посетител и не ползваме чужда аналитична платформа. Броячът тръгва само след съгласие. Основание: чл. 6, §1, б. „а“ от GDPR.",
            "Езикът на сайта се помни с бисквитка site_locale, за да отворим избраната версия. Основание: чл. 6, §1, б. „е“ — без нея езиковото пренасочване не работи.",
            "При изпращане на формата сървърът може за кратко да задържи в паметта адрес за ограничаване на повторни опити. Този адрес не се записва към запитването.",
            "Хостингът може да пази технически логове на заявките за сигурност. Ние не ги ползваме за профилиране."
          ]
        },
        {
          heading: "Кой ги вижда",
          paragraphs: [
            "Запитването чете ателието. Ако базата е Supabase, доставчикът обработва записа в региона на проекта. Пощата минава през конфигурирания доставчик: Gmail, когато се ползват EMAIL_USER и EMAIL_PASSWORD, иначе SMTP хостът от средата. Доставчик извън ЕИП означава предаване извън ЕИП по неговите договорни клаузи.",
            "WhatsApp е отделна услуга на Meta. Връзката wa.me отваря WhatsApp. Ние не получаваме съдържанието на чата през този сайт.",
            "Шрифтовете се сервират от самия сайт. Няма заявка към Google Fonts при отваряне на страницата."
          ]
        },
        {
          heading: "Колко време ги пазим",
          paragraphs: [
            "Запитване, което не е станало продажба, се пази до 24 месеца след последното съобщение по него, после се изтрива от базата. Копието в пощенската кутия се трие отделно от там.",
            "Ако има продажба, договорът, плащането и фактурата се пазят за срока по счетоводното и данъчното законодателство. Той е по-дълъг от срока за обикновено запитване.",
            "Изборът за бисквитки стои в localStorage на браузъра, докато не го смените. Бисквитката за отчетено посещение е 12 часа. Езиковата бисквитка е до една година."
          ]
        },
        {
          heading: "Вашите права",
          paragraphs: [
            `Имате право на достъп, корекция, изтриване, ограничаване, възражение и, когато основанието е договор, преносимост. Съгласието за брояча се оттегля от „Настройки за бисквитки“ във футъра, със същия брой стъпки като даването му.`,
            `Пишете на ${email} или се обадете на публикуваните телефони. Можете да подадете жалба до надзорния орган по местоживеене, месторабота или място на нарушението. Ако търговецът е установен в България, това е Комисията за защита на личните данни (cpdp.bg).`,
            "Формата не изисква отметка „съгласен съм с политиката“. Основанието за запитването не е съгласие, а подготовка на договор. Оттегляне на съгласие важи за брояча на посещения."
          ]
        },
        {
          heading: "Деца",
          paragraphs: [
            "Сайтът продава на възрастни. Не изпращайте запитване от името на дете и не ни пращайте данни на дете."
          ]
        }
      ]
    };
  }

  return {
    title: "Privacy",
    description: "What Gola Handcrafted does with personal data from this site and from inquiries.",
    updated: updatedOn(locale),
    intro: identityParagraph(locale, operator),
    sections: [
      {
        heading: "Who is responsible",
        paragraphs: [
          `${operator.tradeName} decides why data from ${operator.siteUrl} is collected. The legal name, establishment address, and email are on the legal notice, to the extent they are set in the server configuration.`,
          "No data protection officer is designated. For access, correction, or deletion, use the published email or the phone numbers on the site."
        ]
      },
      {
        heading: "What we collect and why",
        paragraphs: [
          "The inquiry form collects your name, email, contact method, inquiry type, message, and optionally a location and size. The legal basis is GDPR Article 6(1)(b): steps before a contract, at your request. The message is stored in the site database when Supabase is configured, and emailed to the atelier and back to you as a copy.",
          "The visit counter stores aggregate counts only (total, today, last 7 days) and the time of the latest counted visit. It does not store an IP address, a per-visitor history, or data in a third-party analytics product. It runs only after you opt in. Basis: GDPR Article 6(1)(a).",
          "The site_locale cookie remembers the language so the site can open the version you are on. Basis: GDPR Article 6(1)(f). The language redirect does not work without it.",
          "When the form is submitted, the server may briefly keep an address in memory to limit repeat submissions. That address is not written onto the inquiry.",
          "The host may keep technical request logs for security. We do not use them to profile visitors."
        ]
      },
      {
        heading: "Who sees it",
        paragraphs: [
          "The atelier reads the inquiry. If the database is Supabase, that provider processes the record in the project region. Mail goes through the configured provider: Gmail when EMAIL_USER and EMAIL_PASSWORD are set, otherwise the SMTP host in the environment. A provider outside the EEA is a transfer outside the EEA under that provider's clauses.",
          "WhatsApp is a separate Meta service. A wa.me link opens WhatsApp. This site does not receive the chat.",
          "Fonts are served by this site. Opening a page does not call Google Fonts."
        ]
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "An inquiry that does not become a sale is kept for 24 months after the last message on it, then deleted from the database. The copy in the mailbox has to be deleted there as well.",
          "If there is a sale, the contract, payment, and invoice are kept for the period required by accounting and tax law. That period is longer than the inquiry period.",
          "The cookie choice stays in localStorage until you change it. The counted-visit cookie lasts 12 hours. The language cookie lasts up to one year."
        ]
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You can ask for access, correction, erasure, restriction, objection, and, where the basis is a contract, portability. Consent for the visit counter is withdrawn from Cookie settings in the footer, in the same number of steps it took to give it.",
          `Write to ${email}, or call the published phone numbers. You can complain to the supervisory authority where you live, where you work, or where the infringement happened. If the trader is established in Bulgaria, that authority is the Commission for Personal Data Protection (cpdp.bg).`,
          "The form does not ask you to tick “I agree to the policy”. The inquiry is not based on consent. It is based on preparing a contract. Withdrawing consent applies to the visit counter."
        ]
      },
      {
        heading: "Children",
        paragraphs: [
          "The shop sells to adults. Do not send an inquiry for a child, and do not send us a child's data."
        ]
      }
    ]
  };
}

function cookies(locale: Locale): LegalDocument {
  if (locale === "bg") {
    return {
      title: "Бисквитки",
      description: "Какво се записва на устройството ви от този сайт.",
      updated: updatedOn(locale),
      intro:
        "Запис на информация на устройството, който не е необходим за услугата, се прави само след избор. Отказът е на същия екран като приемането.",
      sections: [
        {
          heading: "Необходими",
          paragraphs: ["Тези записи не чакат съгласие, защото сайтът не може да изпълни поисканото без тях."],
          items: [
            "site_locale — избраният език (en или bg), до една година, SameSite=Lax. Задава се, за да не се губи езиковата версия при следващо отваряне.",
            "gola_cookie_consent в localStorage — вашият избор „само необходими“ или „и брояч“. Необходим е, за да помним отказа и да не питаме на всяка страница.",
            "gola_admin_session — само след вход в /admin, httpOnly, 12 часа. Не се слага на обикновените посетители."
          ]
        },
        {
          heading: "По избор",
          paragraphs: ["Броячът не тръгва, докато не изберете „Приемам брояча“."],
          items: [
            "gola_visit_counted — httpOnly, 12 часа. Служи само да не броим същото посещение пак. Не съдържа имейл или идентификатор за реклама."
          ]
        },
        {
          heading: "Какво не ползваме",
          paragraphs: [
            "Няма рекламни бисквитки, няма Google Analytics и няма Meta пиксел. Компонентът за Google Translate не е включен. Ако някой го включи отново, той не зарежда Google и не слага бисквитка googtrans без избор „Приемам брояча“."
          ]
        }
      ]
    };
  }

  return {
    title: "Cookies",
    description: "What this site stores on your device.",
    updated: updatedOn(locale),
    intro:
      "Storing information on your device that is not required for the service waits for a choice. Rejecting is on the same screen as accepting.",
    sections: [
      {
        heading: "Required",
        paragraphs: ["These are stored without a consent banner because the site cannot do what you asked without them."],
        items: [
          "site_locale — the language you are using (en or bg), up to one year, SameSite=Lax. It keeps that version on the next visit.",
          "gola_cookie_consent in localStorage — your choice of essential only, or essential plus the visit counter. It is required so a refusal is remembered and the question is not repeated on every page.",
          "gola_admin_session — only after a login at /admin, httpOnly, 12 hours. Ordinary visitors do not get this cookie."
        ]
      },
      {
        heading: "Optional",
        paragraphs: ["The visit counter does not run until you choose Accept the counter."],
        items: [
          "gola_visit_counted — httpOnly, 12 hours. It only stops the same visit from being counted again. It does not hold an email address or an advertising ID."
        ]
      },
      {
        heading: "What we do not use",
        paragraphs: [
          "There are no advertising cookies, no Google Analytics, and no Meta pixel. The Google Translate component is not mounted. If it is turned back on, it does not load Google or set a googtrans cookie unless the visit counter has been accepted."
        ]
      }
    ]
  };
}

function legalNotice(locale: Locale, operator: OperatorProfile): LegalDocument {
  const vatLine =
    operator.vatId != null
      ? locale === "bg"
        ? `ДДС номер: ${operator.vatId}.`
        : `VAT number: ${operator.vatId}.`
      : locale === "bg"
        ? "ДДС номер не е въведен. Публикува се само ако търговецът е регистриран по ДДС."
        : "No VAT number is published. One is shown only when the trader is VAT-registered.";

  const rows = [
    locale === "bg" ? `Търговско име: ${operator.tradeName}.` : `Trade name: ${operator.tradeName}.`,
    operator.legalName
      ? locale === "bg"
        ? `Правно име: ${operator.legalName}.`
        : `Legal name: ${operator.legalName}.`
      : locale === "bg"
        ? "Правно име: не е въведено."
        : "Legal name: not configured.",
    operator.address
      ? locale === "bg"
        ? `Адрес на установяване: ${operator.address}.`
        : `Establishment address: ${operator.address}.`
      : locale === "bg"
        ? "Адрес на установяване: не е въведен."
        : "Establishment address: not configured.",
    operator.uic
      ? locale === "bg"
        ? `Регистърен номер: ${operator.uic}.`
        : `Register number: ${operator.uic}.`
      : locale === "bg"
        ? "Регистърен номер: не е въведен."
        : "Register number: not configured.",
    vatLine,
    operator.email
      ? locale === "bg"
        ? `Имейл: ${operator.email}.`
        : `Email: ${operator.email}.`
      : locale === "bg"
        ? "Имейл: не е въведен. Формата за запитване и телефоните са налични, но директивата за електронната търговия иска и имейл."
        : "Email: not configured. The inquiry form and the phone numbers work, but the e-commerce directive also requires an email address.",
    locale === "bg"
      ? `Телефони: ${operator.phones.join(", ")}.`
      : `Phones: ${operator.phones.join(", ")}.`,
    locale === "bg" ? `Сайт: ${operator.siteUrl}.` : `Site: ${operator.siteUrl}.`
  ];

  if (locale === "bg") {
    return {
      title: "Правна информация",
      description: "Идентификация на търговеца и достъпност на сайта.",
      updated: updatedOn(locale),
      intro: identityParagraph(locale, operator),
      sections: [
        {
          heading: "Търговец",
          paragraphs: [
            "Тази страница е постоянната идентификация по чл. 5 от Директива 2000/31/ЕО и Закона за електронната търговия.",
            ...rows
          ]
        },
        {
          id: "accessibility",
          heading: "Достъпност",
          paragraphs: [
            "Страницата има език на документа, връзка „към съдържанието“, видимо фокусиране, етикети на полетата и алтернативен текст на снимките на продуктите. Анимациите по подразбиране не са безкрайни. При „намалено движение“ в системата плавното превъртане се изключва.",
            "Не публикуваме декларация, че сайтът отговаря на WCAG 2.2 AA или на EN 301 549. Такъв одит не е правен тук. Европейският акт за достъпността покрива услуги за електронна търговия от 28 юни 2025 г. Микропредприятие (под 10 души и оборот или баланс до 2 млн. евро) е изключено от изискванията за услуги. Ако ателието не е микропредприятие, този акт важи и сайтът трябва да се доведе до EN 301 549 отделно от тази страница.",
            "Ако нещо по сайта не може да се ползва, пишете на публикувания имейл или се обадете. Ще отговорим с информацията по друг начин, който ви върши работа."
          ]
        }
      ]
    };
  }

  return {
    title: "Legal notice",
    description: "Trader identity and how to reach the shop about accessibility.",
    updated: updatedOn(locale),
    intro: identityParagraph(locale, operator),
    sections: [
      {
        heading: "Trader",
        paragraphs: [
          "This page is the standing identification required by Article 5 of Directive 2000/31/EC and the Bulgarian Electronic Commerce Act.",
          ...rows
        ]
      },
      {
        id: "accessibility",
        heading: "Accessibility",
        paragraphs: [
          "Pages set a document language, a skip link, a visible focus ring, labels on form fields, and alternative text on product photographs. Motion is not an infinite loop. If the system asks for reduced motion, smooth scrolling is turned off.",
          "This site does not claim conformance with WCAG 2.2 AA or EN 301 549. No such audit has been recorded here. The European Accessibility Act covers e-commerce services from 28 June 2025. A microenterprise (fewer than 10 people, and turnover or balance sheet up to EUR 2 million) is exempt from the service requirements. If the atelier is not a microenterprise, that Act applies and the site still has to be brought to EN 301 549 apart from this page.",
          "If something on the site cannot be used, write to the published email or call. We will provide the information another way that works for you."
        ]
      }
    ]
  };
}

function terms(locale: Locale, operator: OperatorProfile): LegalDocument {
  const vat = vatParagraph(locale, operator.pricesIncludeVat);
  if (locale === "bg") {
    return {
      title: "Условия за запитване и продажба",
      description: "Какво прави формата, как се образува договор и какви права има потребителят в ЕС.",
      updated: updatedOn(locale),
      intro:
        "Сайтът показва изделия и приема запитвания. Не е кошница с плащане. Договор не се сключва с изпращане на формата.",
      sections: [
        {
          heading: "Поръчка",
          paragraphs: [
            "Запитването не е поръчка и не обвързва нито вас, нито ателието. Договор има едва когато потвърдим изделието, цената и доставката в съобщение, което можете да запазите (имейл или друг траен запис).",
            "Картови номера не се въвеждат на този сайт. Не ги пишете във формата. Плащането се уговаря извън сайта, след потвърждението.",
            vat,
            "Доставката не е включена в цената на изделието, освен ако потвърждението изрично казва друго. Разходът за доставка, или че още не може да бъде изчислен, се казва преди да платите."
          ]
        },
        {
          heading: "Отказ от договора",
          paragraphs: [
            "Ако сте потребител в ЕС и договорът е от разстояние, имате 14 дни да се откажете без причина. Срокът тече от деня, в който вие или посочен от вас човек получи стоката. Съобщението за отказ стига в писмен вид до контакта от правната информация. Може да ползвате обикновен текст: че се отказвате от договора, с името си, датата и кое изделие касае.",
            "Изключението за стока, изработена по ваша спецификация или ясно персонализирана (гравиране, размер или материя по поръчка), важи само когато ви го кажем преди да приемете поръчката. Готово изделие без такава персонализация запазва правото на отказ. Не махаме отказа с обща клауза за цялата колекция.",
            "Кой плаща директния разход по връщане на непресонализирана стока се пише в потвърждението. Ако потвърждението мълчи, разходът по връщането е за ателието. Адресът за връщане е седалището от правната информация или адресът от потвърждението.",
            "При отказ връщаме платеното за стоката, включително първоначалната доставка до най-евтиния предложен от нас начин, без излишно забавяне и не по-късно от 14 дни след като сме уведомени. Можем да задържим връщането, докато получим стоката или доказателство, че сте я изпратили."
          ]
        },
        {
          heading: "Съответствие",
          paragraphs: [
            "Потребителят в ЕС има законова гаранция за съответствие две години от доставката. Тя не се заменя от тази страница и не се скъсява заради ръчната изработка.",
            "Жилките, нюансът и дребните разлики на дървото и кожата са свойство на материала. Описваме ги преди потвърждение на поръчката. Сами по себе си не са липса на съответствие. Липса има, когато изделието не отговаря на уговореното описание, размер или персонализация.",
            "Рекламация се подава до публикувания контакт. Може да се обърнете и към Комисията за защита на потребителите (kzp.bg) или към Европейския потребителски център във вашата страна."
          ]
        }
      ]
    };
  }

  return {
    title: "Inquiry and sale terms",
    description: "What the form does, when a contract exists, and which EU consumer rights apply.",
    updated: updatedOn(locale),
    intro:
      "This site shows pieces and takes inquiries. It is not a checkout. Sending the form does not create a contract.",
    sections: [
      {
        heading: "Orders",
        paragraphs: [
          "An inquiry is not an order and does not bind you or the atelier. A contract exists only when we confirm the piece, the price, and delivery in a message you can keep (email or another durable record).",
          "Card numbers are not collected on this site. Do not put them in the form. Payment is arranged off the site, after that confirmation.",
          vat,
          "Delivery is not included in the piece price unless the confirmation says it is. The delivery cost, or the fact that it cannot be calculated yet, is stated before you pay."
        ]
      },
      {
        heading: "Withdrawal",
        paragraphs: [
          "If you are a consumer in the EU and the contract is a distance contract, you have 14 days to withdraw without giving a reason. The period starts on the day you, or someone you named, receive the goods. A withdrawal notice in writing to the contact on the legal notice is enough. Plain text works: that you withdraw, your name, the date, and which piece.",
          "The exception for goods made to your specification, or clearly personalized (engraving, made-to-order size or material), is used only when we tell you that before you accept the order. A ready piece without that personalization keeps the withdrawal right. There is no blanket waiver for the whole collection.",
          "Who pays the direct cost of returning a non-personalized piece is stated in the confirmation. If the confirmation says nothing, the atelier pays that return cost. The return address is the establishment address on the legal notice, or the address in the confirmation.",
          "On withdrawal we refund what you paid for the goods, including the initial standard delivery at the cheapest method we offered, without undue delay and no later than 14 days after we are told. We may wait until we receive the goods or proof that you sent them."
        ]
      },
      {
        heading: "Conformity",
        paragraphs: [
          "An EU consumer has the legal guarantee of conformity for two years from delivery. This page does not replace that guarantee and hand-making does not shorten it.",
          "Grain, tone, and small differences in wood and leather are properties of the material. They are described before an order is confirmed. On their own they are not a lack of conformity. A lack of conformity is a piece that does not match the description, size, or personalization that was agreed.",
          "A complaint goes to the published contact. You can also go to the Bulgarian Commission for Consumer Protection (kzp.bg) or to the European Consumer Centre in your country."
        ]
      }
    ]
  };
}

export function getLegalDocument(locale: Locale, doc: LegalDoc): LegalDocument {
  const operator = getOperator();
  if (doc === "privacy") return privacy(locale, operator);
  if (doc === "cookies") return cookies(locale);
  if (doc === "legal-notice") return legalNotice(locale, operator);
  return terms(locale, operator);
}

export function legalNav(locale: Locale): { label: string; href: string }[] {
  const items: { doc: LegalDoc; en: string; bg: string }[] = [
    { doc: "legal-notice", en: "Legal notice", bg: "Правна информация" },
    { doc: "privacy", en: "Privacy", bg: "Поверителност" },
    { doc: "cookies", en: "Cookies", bg: "Бисквитки" },
    { doc: "terms", en: "Terms", bg: "Условия" }
  ];
  return items.map((item) => ({
    label: locale === "bg" ? item.bg : item.en,
    href: `/${locale}/${item.doc}`
  }));
}

export function legalChrome(locale: Locale): {
  navLabel: string;
  cookieSettings: string;
  backHome: string;
  updatedLabel: string;
} {
  if (locale === "bg") {
    return {
      navLabel: "Правна информация",
      cookieSettings: "Настройки за бисквитки",
      backHome: "Към началото",
      updatedLabel: "Обновено"
    };
  }
  return {
    navLabel: "Legal",
    cookieSettings: "Cookie settings",
    backHome: "Back home",
    updatedLabel: "Updated"
  };
}

export function inquiryPrivacyNotice(locale: Locale): {
  before: string;
  privacy: string;
  and: string;
  terms: string;
} {
  if (locale === "bg") {
    return {
      before:
        "Изпращането не е поръчка. Ползваме името, имейла, контакта и съобщението само за да отговорим. Вижте",
      privacy: "поверителността",
      and: "и",
      terms: "условията"
    };
  }
  return {
    before:
      "Sending this is not an order. We use your name, email, contact details, and message only to answer this inquiry. Read the",
    privacy: "privacy notice",
    and: "and the",
    terms: "terms"
  };
}

export function cookieBannerCopy(locale: Locale): {
  title: string;
  body: string;
  accept: string;
  reject: string;
  policy: string;
} {
  if (locale === "bg") {
    return {
      title: "Бисквитки",
      body: "Езиковата бисквитка е необходима и вече е активна. Броячът на посещения е по избор и не тръгва, докато не се съгласите. Отказът не променя разглеждането на сайта.",
      accept: "Приемам брояча",
      reject: "Само необходимите",
      policy: "Политика за бисквитки"
    };
  }
  return {
    title: "Cookies",
    body: "The language cookie is required and is already on. The visit counter is optional and stays off until you allow it. Refusing it does not change browsing.",
    accept: "Accept the counter",
    reject: "Essential only",
    policy: "Cookie policy"
  };
}

export function customerReceiptNote(locale: Locale): string {
  const operator = getOperator();
  if (locale === "bg") {
    return `Това е копие на запитване, не потвърдена поръчка. Договор има едва след наше потвърждение на изделието, цената и доставката. ${vatParagraph("bg", operator.pricesIncludeVat)} Условия: ${operator.siteUrl}/bg/terms`;
  }
  return `This is a copy of an inquiry, not a confirmed order. A contract exists only after we confirm the piece, the price, and delivery. ${vatParagraph("en", operator.pricesIncludeVat)} Terms: ${operator.siteUrl}/en/terms`;
}
