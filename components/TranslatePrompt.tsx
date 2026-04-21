"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_LANGUAGE = "en";
const SESSION_KEY = "gola_translate_prompt_seen";
const GOOGLE_SCRIPT_ID = "google-translate-loader";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay?: boolean },
          elementId: string
        ) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

function getPreferredLanguage() {
  if (typeof navigator === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  return (navigator.language || DEFAULT_LANGUAGE).split("-")[0].toLowerCase();
}

export default function TranslatePrompt() {
  const [open, setOpen] = useState(false);
  const preferredLanguage = useMemo(getPreferredLanguage, []);

  useEffect(() => {
    if (preferredLanguage === DEFAULT_LANGUAGE) {
      return;
    }

    const alreadyAsked = window.sessionStorage.getItem(SESSION_KEY) === "true";
    if (!alreadyAsked) {
      setOpen(true);
    }
  }, [preferredLanguage]);

  const dismissPrompt = () => {
    window.sessionStorage.setItem(SESSION_KEY, "true");
    setOpen(false);
  };

  const applyTranslation = () => {
    const initAndTranslate = () => {
      window.googleTranslateElementInit = () => {
        new window.google!.translate!.TranslateElement(
          {
            pageLanguage: DEFAULT_LANGUAGE,
            autoDisplay: false
          },
          "google_translate_element"
        );

        const setLanguage = () => {
          const selector = document.querySelector<HTMLSelectElement>(".goog-te-combo");
          if (!selector) {
            window.setTimeout(setLanguage, 250);
            return;
          }

          selector.value = preferredLanguage;
          selector.dispatchEvent(new Event("change"));
        };

        window.setTimeout(setLanguage, 300);
      };

      if (window.google?.translate?.TranslateElement) {
        window.googleTranslateElementInit();
      }
    };

    document.cookie = `googtrans=/${DEFAULT_LANGUAGE}/${preferredLanguage};path=/`;
    document.cookie = `googtrans=/${DEFAULT_LANGUAGE}/${preferredLanguage};domain=${window.location.hostname};path=/`;

    if (!document.getElementById(GOOGLE_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = GOOGLE_SCRIPT_ID;
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
      initAndTranslate();
    } else {
      initAndTranslate();
    }

    dismissPrompt();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-ivory/20 bg-ink p-5 shadow-luxury">
        <h2 className="text-base font-semibold text-ivory sm:text-lg">Translate this page?</h2>
        <p className="mt-2 text-sm text-ivory/80">
          We detected your browser language and can translate this site for easier reading.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={dismissPrompt}
            className="focus-ring rounded-full border border-ivory/30 px-4 py-2 text-sm text-ivory/85 transition hover:border-ivory/50"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={applyTranslation}
            className="focus-ring rounded-full bg-caramel px-4 py-2 text-sm font-medium text-ink transition hover:bg-[#d2a577]"
          >
            Translate
          </button>
        </div>
      </div>
    </div>
  );
}
