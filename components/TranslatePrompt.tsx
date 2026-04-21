"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_LANGUAGE = "en";
const DECISION_KEY = "gola_translate_prompt_decision_v1";
const GOOGLE_SCRIPT_ID = "google-translate-loader";
const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "bg", label: "Bulgarian" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "it", label: "Italian" },
  { value: "nl", label: "Dutch" },
  { value: "pt", label: "Portuguese" },
  { value: "ro", label: "Romanian" },
  { value: "tr", label: "Turkish" }
];

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
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    const isSupportedLanguage = LANGUAGE_OPTIONS.some((option) => option.value === preferredLanguage);
    if (isSupportedLanguage) {
      setSelectedLanguage(preferredLanguage);
    }
  }, [preferredLanguage]);

  useEffect(() => {
    const decision = window.localStorage.getItem(DECISION_KEY);
    if (decision) {
      return;
    }

    window.setTimeout(() => setOpen(true), 250);
  }, []);

  const dismissPrompt = (decision: "dismissed" | "accepted" = "dismissed") => {
    window.localStorage.setItem(DECISION_KEY, decision);
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

          selector.value = selectedLanguage;
          selector.dispatchEvent(new Event("change"));
        };

        window.setTimeout(setLanguage, 300);
      };

      if (window.google?.translate?.TranslateElement) {
        window.googleTranslateElementInit();
      }
    };

    document.cookie = `googtrans=/${DEFAULT_LANGUAGE}/${selectedLanguage};path=/`;
    document.cookie = `googtrans=/${DEFAULT_LANGUAGE}/${selectedLanguage};domain=${window.location.hostname};path=/`;

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

    dismissPrompt("accepted");
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-ivory/20 bg-ink p-5 shadow-luxury">
        <h2 className="text-base font-semibold text-ivory sm:text-lg">Translate this page?</h2>
        <p className="mt-2 text-sm text-ivory/80">Choose a language for this site.</p>
        <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-ivory/70">
          Language
          <select
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            className="mt-2 w-full rounded-xl border border-ivory/20 bg-ink px-3 py-2 text-sm text-ivory outline-none transition focus:border-caramel"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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
