export const ANALYTICS_CONSENT_KEY = "gola-analytics-consent";
export const ANALYTICS_CONSENT_EVENT = "gola-analytics-consent";
export const OPEN_CONSENT_EVENT = "gola-open-consent";

export type AnalyticsConsent = "accepted" | "rejected";

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
}
