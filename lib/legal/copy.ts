import type { Locale } from "@/lib/i18n";

export const legalCopy = {
  en: {
    privacyTitle: "Privacy notice",
    legalTitle: "Legal notice",
    privacyLink: "Privacy notice",
    legalLink: "Legal notice",
    cookieSettings: "Cookie settings",
    legalNavLabel: "Legal",
    updated: "Updated 18 November 2026",
    home: "Back to the shop",
    inquiryNotice:
      "Your name, email, contact method, and message are used only to answer this inquiry. They are not added to a mailing list.",
    banner:
      "Visit counts run only if you allow them. The language cookie is required to remember Bulgarian or English and stays on. Visit measurement sets one first-party cookie for 12 hours and stores no name or email.",
    accept: "Accept",
    reject: "Reject",
  },
  bg: {
    privacyTitle: "Политика за поверителност",
    legalTitle: "Правна информация",
    privacyLink: "Поверителност",
    legalLink: "Правна информация",
    cookieSettings: "Настройки за бисквитки",
    legalNavLabel: "Правна информация",
    updated: "Обновено на 18 ноември 2026",
    home: "Към магазина",
    inquiryNotice:
      "Името, имейлът, начинът за връзка и съобщението се ползват само за отговор на това запитване. Не ги добавяме към рекламен списък.",
    banner:
      "Посещенията се броят само ако разрешиш. Бисквитката за език е нужна, за да запомним български или английски, и остава включена. Броенето слага една наша бисквитка за 12 часа и не пази име или имейл.",
    accept: "Приемам",
    reject: "Отказвам",
  },
} as const satisfies Record<
  Locale,
  {
    privacyTitle: string;
    legalTitle: string;
    privacyLink: string;
    legalLink: string;
    cookieSettings: string;
    legalNavLabel: string;
    updated: string;
    home: string;
    inquiryNotice: string;
    banner: string;
    accept: string;
    reject: string;
  }
>;
