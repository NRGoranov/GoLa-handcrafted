export type InquiryPrefillDetail = {
  message: string;
  inquiryType?: string;
};

export const INQUIRY_PREFILL_EVENT = "gola:inquiry-prefill";
const STORAGE_KEY = "gola-inquiry-prefill";

export function dispatchInquiryPrefill(detail: InquiryPrefillDetail): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(detail));
  window.dispatchEvent(new CustomEvent<InquiryPrefillDetail>(INQUIRY_PREFILL_EVENT, { detail }));
}

export function consumeInquiryPrefill(): InquiryPrefillDetail | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(STORAGE_KEY);
  try {
    return JSON.parse(raw) as InquiryPrefillDetail;
  } catch {
    return null;
  }
}

export function scrollToInquirySection(): void {
  document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
