export const locales = ["en", "bg"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

type SiteCopy = {
  nav: {
    links: { collection: string; craftsmanship: string; custom: string; inquiry: string };
    menu: string;
    openMenuAria: string;
    closeMenuAria: string;
    goToTop: string;
    homeAria: string;
    languageLabel: string;
  };
  hero: {
    imageAlt: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  collection: { eyebrow: string; title: string; description: string };
  craftsmanship: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: [string, string, string];
    imageAlt: string;
  };
  custom: {
    eyebrow: string;
    title: string;
    description: string;
    highlight: {
      title: string;
      body: string;
    };
    cards: {
      sizingTitle: string;
      sizingBody: string;
      personalizationTitle: string;
      personalizationBody: string;
      bespokeTitle: string;
      bespokeBody: string;
    };
  };
  inquiry: {
    eyebrow: string;
    title: string;
    description: string;
    note: string;
    statusAria: string;
    importantTitle: string;
    formNotActive: string;
    or: string;
    fields: {
      name: string;
      email: string;
      contactMethod: string;
      contactPlaceholder: string;
      inquiryType: string;
      locationOptional: string;
      preferredSizeOptional: string;
      message: string;
      requiredMark: string;
    };
    inquiryTypes: {
      availability: string;
      customRequest: string;
      deliveryQuestion: string;
      personalization: string;
      general: string;
    };
    submitDisabled: string;
    errors: { submitFailed: string; generic: string };
    success: string;
  };
  footer: {
    brandLine: string;
    siteBy: string;
    availabilityLine: string;
  };
  product: {
    viewDetails: string;
    close: string;
    requestThisPiece: string;
    labels: {
      model: string;
      dimensions: string;
      dimensionsHint: string;
      price: string;
      availability: string;
      customization: string;
      inside: string;
      liningColor: string;
      insidePockets: string;
      engraving: string;
      woodCoatingColor: string;
      chainColor: string;
    };
    values: {
      availabilityByInquiry: string;
      customizationYes: string;
      customizationNo: string;
      insideLeather: string;
    };
    options: {
      colors: string[];
      woodCoatingColors: string[];
      chainColors: string[];
      pocketsAdds: string; // "{amount}" placeholder
      engravingAdds: string; // "{amount}" placeholder
    };
    aria: {
      viewDetailsFor: string; // "{name}" placeholder
      modalLabel: string; // "{name}" placeholder
      viewImage: string; // "{name}" placeholder
      viewNamedImage: string; // "{name}" placeholder
      thumbnail: string; // "{name}" placeholder
      heroAlt: string;
    };
    models: Record<
      string,
      {
        name: string;
        description: string;
      }
    >;
  };
  seo: {
    homeTitle: string;
    homeDescription: string;
    ogTitle: string;
    ogDescription: string;
    breadcrumbHome: string;
  };
};

const dictionary: Record<Locale, SiteCopy> = {
  en: {
    nav: {
      links: {
        collection: "Collection",
        craftsmanship: "Craftsmanship",
        custom: "Custom",
        inquiry: "Inquiry"
      },
      menu: "Menu",
      openMenuAria: "Open menu",
      closeMenuAria: "Close menu",
      goToTop: "Go to top",
      homeAria: "Gola Handcrafted home",
      languageLabel: "Language"
    },
    hero: {
      imageAlt: "Handcrafted wooden and leather handbag by GoLa Handcrafted",
      title: "Handcrafted elegance, shaped in wood and leather.",
      subtitle: "Made slowly, finished precisely, and built to feel personal.",
      ctaPrimary: "Request a piece",
      ctaSecondary: "Explore the collection"
    },
    collection: {
      eyebrow: "Collection",
      title: "Signature models",
      description:
        "Three distinct forms in hand-finished wood and leather—available through personal inquiry."
    },
    craftsmanship: {
      eyebrow: "Process",
      title: "Crafted with intention",
      description:
        "Every piece is made by hand: careful material selection, measured shaping, and finishing that favors character over volume.",
      bullets: [
        "No mass production—bags are created in small, attentive runs.",
        "Hand-finished edges, considered hardware placement, and grain-matched panels.",
        "Natural variations are embraced, making each piece one of a kind."
      ],
      imageAlt: "Close-up of handcrafted woodworking and leather stitching"
    },
    custom: {
      eyebrow: "Atelier",
      title: "Made for you",
      description:
        "A consultation-led approach that lets you shape a piece around your routine, style, and intent — including bag customisation and personal engravings on request.",
      highlight: {
        title: "Customisation & engraving (on request)",
        body: "You can customise the bag and request a personal engraving. Mention your idea in the inquiry and we’ll confirm what’s possible."
      },
      cards: {
        sizingTitle: "Custom sizing",
        sizingBody: "Choose proportions and carry options that fit your daily essentials.",
        personalizationTitle: "Personalization",
        personalizationBody:
          "Refine finishes, tones, and details for a distinctly personal feel. Personal engravings are available on request.",
        bespokeTitle: "Bespoke requests",
        bespokeBody: "Collaborate with the atelier on one-off concepts and special commissions."
      }
    },
    inquiry: {
      eyebrow: "Inquiry",
      title: "Begin your request",
      description:
        "Share what you have in mind and we’ll respond with availability, lead time, and bespoke options.",
      note: "This studio works by inquiry only—each reply is tailored to your request.",
      statusAria: "Inquiry form status notice",
      importantTitle: "Important",
      formNotActive:
        "The website form isn’t active yet. Please contact us on WhatsApp at",
      or: "or",
      fields: {
        name: "Name",
        email: "Email",
        contactMethod: "Contact method",
        contactPlaceholder: "Email, WhatsApp, phone…",
        inquiryType: "Inquiry type",
        locationOptional: "Location (optional)",
        preferredSizeOptional: "Preferred size (optional)",
        message: "Message",
        requiredMark: "*"
      },
      inquiryTypes: {
        availability: "Availability",
        customRequest: "Custom request",
        deliveryQuestion: "Delivery question",
        personalization: "Personalization",
        general: "General"
      },
      submitDisabled: "Form temporarily unavailable",
      errors: { submitFailed: "Unable to submit inquiry.", generic: "Something went wrong." },
      success: "Thank you—your inquiry has been received."
    },
    footer: {
      brandLine: "GoLa Handcrafted - Wooden & Leather Handbags",
      siteBy: "Site by",
      availabilityLine: "Available by inquiry only. Crafted in limited quantities."
    },
    product: {
      viewDetails: "View details",
      close: "Close",
      requestThisPiece: "Request this piece",
      labels: {
        model: "Model",
        dimensions: "Dimensions",
        dimensionsHint: "L x W x H (cm)",
        price: "Price",
        availability: "Availability",
        customization: "Customization",
        inside: "Inside",
        liningColor: "Inside color",
        insidePockets: "Inside pockets",
        engraving: "Custom engraving",
        woodCoatingColor: "Wood coating color",
        chainColor: "Chain color"
      },
      values: {
        availabilityByInquiry: "Available by inquiry",
        customizationYes: "Yes - made to request",
        customizationNo: "No",
        insideLeather: "естествена кожа (natural leather)"
      },
      options: {
        colors: [
          "Light Beige",
          "Olive Green",
          "Burgundy",
          "Teal",
          "Dusty Pink",
          "Black",
          "Charcoal Grey",
          "Coral",
          "Cognac Brown"
        ],
        woodCoatingColors: ["Natural", "Walnut", "Mahogany", "Ebony"],
        chainColors: ["Gold", "Silver", "Bronze", "Black"],
        pocketsAdds: "adds +EUR {amount}",
        engravingAdds: "adds +EUR {amount}"
      },
      aria: {
        viewDetailsFor: "View details for {name}",
        modalLabel: "{name} details",
        viewImage: "View {name} image",
        viewNamedImage: "{name} handbag view",
        thumbnail: "{name} thumbnail",
        heroAlt: "Handcrafted wooden and leather handbag by GoLa Handcrafted"
      },
      models: {
        "model-1": {
          name: "Model 1",
          description:
            "Compact and poised, with a quiet presence—made for everyday moments that still feel considered."
        },
        "model-2": {
          name: "Model 2",
          description:
            "Balanced proportions with tactile depth, for those who prefer a statement that doesn’t need to announce itself."
        },
        "model-3": {
          name: "Model 3",
          description:
            "Bold in character and generous in space—an elevated companion for travel, evenings, and everything in between."
        },
        "model-4": {
          name: "Model 4",
          description: "Light in hand, effortless in line—an airy silhouette with refined proportion and ease."
        }
      }
    },
    seo: {
      homeTitle: "Handcrafted Wooden & Leather Handbags",
      homeDescription:
        "Explore handcrafted handbags by Gola Handcrafted, featuring natural wood and leather designs, artisan-made details, and premium statement accessories.",
      ogTitle: "Handcrafted Wooden & Leather Handbags | Gola Handcrafted",
      ogDescription:
        "Discover premium handcrafted handbags that blend natural wood and leather with refined artisan design.",
      breadcrumbHome: "Home"
    }
  },
  bg: {
    nav: {
      links: {
        collection: "Колекция",
        craftsmanship: "Изработка",
        custom: "По поръчка",
        inquiry: "Запитване"
      },
      menu: "Меню",
      openMenuAria: "Отвори менюто",
      closeMenuAria: "Затвори менюто",
      goToTop: "Към началото",
      homeAria: "Начало на GoLa Handcrafted",
      languageLabel: "Език"
    },
    hero: {
      imageAlt: "Ръчно изработена чанта от дърво и кожа от GoLa Handcrafted",
      title: "Елегантност от дърво и кожа.",
      subtitle: "Всяка чанта се изработва бавно и прецизно, с внимание към детайла.",
      ctaPrimary: "Свържи се с нас",
      ctaSecondary: "Виж колекцията"
    },
    collection: {
      eyebrow: "Колекция",
      title: "Емблематични модели",
      description:
        "Три характерни форми от дърво и кожа — налични чрез лично запитване."
    },
    craftsmanship: {
      eyebrow: "Процес",
      title: "Създадено с отношение",
      description:
        "Всяко изделие се прави на ръка: внимателно подбрани материали, прецизно оформяне и завършек, който поставя характера пред количеството.",
      bullets: [
        "Без масово производство — работим в малки серии с подбрани материали.",
        "Ръчно завършени ръбове, премерено позициониране на обкова и подбрани по шарка панели.",
        "Естествените вариации се запазват — за да е всяка чанта истински уникална."
      ],
      imageAlt: "Детайл от дървообработка и кожени шевове на ръка"
    },
    custom: {
      eyebrow: "Ателие",
      title: "Създадено за теб",
      description:
        "Работим чрез консултация — така оформяш чантата спрямо ежедневието и стила си, с възможност за персонализация и лично гравиране при запитване.",
      highlight: {
        title: "Персонализация и гравиране (при запитване)",
        body: "Можеш да персонализираш чантата и да заявиш лично гравиране. Опиши желанието си в запитването и ще потвърдим възможностите."
      },
      cards: {
        sizingTitle: "Размер по мярка",
        sizingBody: "Избери пропорции и начин на носене, които пасват на вещите ти.",
        personalizationTitle: "Детайли",
        personalizationBody:
          "Избери тонове, финиши и елементи, които да отразят твоя стил. Лично гравиране е възможно при запитване.",
        bespokeTitle: "Индивидуални идеи",
        bespokeBody: "Работи директно с ателието по единични концепции и специални поръчки."
      }
    },
    inquiry: {
      eyebrow: "Запитване",
      title: "Запитване",
      description:
        "Сподели какво търсиш и ще отговорим с наличности, срок и възможности за поръчка.",
      note: "Работим основно чрез запитвания — отговорът е съобразен с конкретната ти идея.",
      statusAria: "Статус на формата за запитване",
      importantTitle: "Важно",
      formNotActive:
        "Формата в сайта все още не е активна. Моля, пиши ни в WhatsApp на",
      or: "или",
      fields: {
        name: "Име",
        email: "Имейл",
        contactMethod: "Как да се свържем",
        contactPlaceholder: "Имейл, WhatsApp, телефон…",
        inquiryType: "Тема на запитването",
        locationOptional: "Локация (по желание)",
        preferredSizeOptional: "Предпочитан размер (по желание)",
        message: "Съобщение",
        requiredMark: "*"
      },
      inquiryTypes: {
        availability: "Наличност",
        customRequest: "Поръчка",
        deliveryQuestion: "Доставка",
        personalization: "Детайли",
        general: "Общо"
      },
      submitDisabled: "Формата е временно недостъпна",
      errors: {
        submitFailed: "Не успяхме да изпратим запитването.",
        generic: "Възникна проблем. Опитай отново."
      },
      success: "Благодарим — получихме запитването ти."
    },
    footer: {
      brandLine: "GoLa Handcrafted — чанти от дърво и кожа",
      siteBy: "Сайт от",
      availabilityLine: "Поръчки само със запитване. Изработка в ограничени количества."
    },
    product: {
      viewDetails: "Детайли",
      close: "Затвори",
      requestThisPiece: "Свържи се с нас за този модел",
      labels: {
        model: "Модел",
        dimensions: "Размери",
        dimensionsHint: "Д x Ш x В (см)",
        price: "Цена",
        availability: "Наличност",
        customization: "Персонализация",
        inside: "Отвътре",
        liningColor: "Цвят отвътре",
        insidePockets: "Вътрешни джобове",
        engraving: "Персонално гравиране",
        woodCoatingColor: "Цвят на покритието",
        chainColor: "Цвят на верижката"
      },
      values: {
        availabilityByInquiry: "Само със запитване",
        customizationYes: "Да — изработка по заявка",
        customizationNo: "Не",
        insideLeather: "естествена кожа"
      },
      options: {
        colors: [
          "Светъл бежов",
          "Маслинено зелено",
          "Бордо",
          "Петрол",
          "Пудра розово",
          "Черно",
          "Графит",
          "Корал",
          "Коняк"
        ],
        woodCoatingColors: ["Естествен", "Орех", "Махагон", "Абанос"],
        chainColors: ["Златен", "Сребърен", "Бронзов", "Черен"],
        pocketsAdds: "+EUR {amount}",
        engravingAdds: "+EUR {amount}"
      },
      aria: {
        viewDetailsFor: "Виж детайли за {name}",
        modalLabel: "Детайли за {name}",
        viewImage: "Виж снимка на {name}",
        viewNamedImage: "Изглед на чанта {name}",
        thumbnail: "Миниатюра на {name}",
        heroAlt: "Ръчно изработена чанта от дърво и кожа от GoLa Handcrafted"
      },
      models: {
        "model-1": {
          name: "Модел 1",
          description:
            "Компактен и изискан — с тихо присъствие, подходящ за ежедневието."
        },
        "model-2": {
          name: "Модел 2",
          description:
            "Премерени пропорции и богата текстура — за хора, които харесват акцент без показност."
        },
        "model-3": {
          name: "Модел 3",
          description:
            "Силен характер и повече пространство — за път, вечерни поводи и динамични дни."
        },
        "model-4": {
          name: "Модел 4",
          description:
            "По-лек силует и елегантни пропорции — за удобно носене всеки ден."
        }
      }
    },
    seo: {
      homeTitle: "Ръчно изработени чанти от дърво и кожа",
      homeDescription:
        "Открий ръчно изработени чанти GoLa Handcrafted — естествено дърво и кожа, майсторска изработка и модели с отличим характер.",
      ogTitle: "Чанти от дърво и кожа | GoLa Handcrafted",
      ogDescription:
        "Премиум чанти, съчетаващи естествено дърво и кожа, създадени с фин усет и ръчен завършек.",
      breadcrumbHome: "Начало"
    }
  }
};

export function getCopy(locale: Locale): SiteCopy {
  return dictionary[locale];
}

export function getLocalizedProduct(
  locale: Locale,
  product: { id: string; name: string; description: string }
): { name: string; description: string } {
  const copy = dictionary[locale];
  const override = copy.product.models[product.id];
  return override ? { name: override.name, description: override.description } : product;
}

export function getPreferredLocaleFromAcceptLanguage(value: string | null): Locale {
  if (!value) return "en";
  const lowered = value.toLowerCase();
  if (lowered.includes("bg")) return "bg";
  return "en";
}

