export const INQUIRY_TYPE_KEYS = [
  "availability",
  "customRequest",
  "deliveryQuestion",
  "personalization",
  "general"
] as const;

export type InquiryTypeKey = (typeof INQUIRY_TYPE_KEYS)[number];

export const INQUIRY_TYPE_LABELS: Record<InquiryTypeKey, string> = {
  availability: "Availability",
  customRequest: "Custom Request",
  deliveryQuestion: "Delivery Question",
  personalization: "Personalization",
  general: "General"
};

export function isInquiryTypeKey(value: string): value is InquiryTypeKey {
  return INQUIRY_TYPE_KEYS.includes(value as InquiryTypeKey);
}
