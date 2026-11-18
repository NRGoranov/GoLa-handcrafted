export const CONSENT_STORAGE_KEY = "gola_cookie_consent";
export const CONSENT_CHANGED_EVENT = "gola-cookie-consent";
export const OPEN_CONSENT_EVENT = "gola-open-cookie-settings";

export type ConsentChoice = "all" | "essential";

export function readConsentChoice(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "all" || value === "essential" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsentChoice(choice: ConsentChoice): void {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: choice }));
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
