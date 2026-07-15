import { NextResponse } from "next/server";
import { isSmtpConfigured, sendInquiryMail } from "@/lib/mail";
import { saveInquiry } from "@/lib/inquiries/store";
import {
  INQUIRY_TYPE_LABELS,
  isInquiryTypeKey,
  type InquiryTypeKey
} from "@/lib/inquiries/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<
      InquiryPayload & { inquiryType: string; locale?: string; website?: string }
    >;

    if (body.website) {
      return NextResponse.json({ ok: false, message: "Invalid submission." }, { status: 400 });
    }

    const validated = validatePayload(body);
    const inquiryTypeLabel = INQUIRY_TYPE_LABELS[validated.inquiryTypeKey];

    await saveInquiry({
      name: validated.name,
      email: validated.email,
      contactMethod: validated.contactMethod,
      inquiryType: validated.inquiryTypeKey,
      inquiryTypeLabel,
      message: validated.message,
      location: validated.location ?? null,
      preferredSize: validated.preferredSize ?? null,
      locale: validated.locale
    });

    let emailed = false;
    if (isSmtpConfigured()) {
      await sendInquiryMail({
        name: validated.name,
        email: validated.email,
        contactMethod: validated.contactMethod,
        inquiryType: inquiryTypeLabel,
        message: validated.message,
        location: validated.location,
        preferredSize: validated.preferredSize,
        locale: validated.locale
      });
      emailed = true;
    } else if (process.env.NODE_ENV === "production") {
      throw new Error("Email is not configured on the server.");
    }

    return NextResponse.json({
      ok: true,
      emailed,
      message: emailed
        ? "Inquiry sent successfully."
        : "Inquiry received. Email will be enabled once SMTP is configured."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status =
      message.toLowerCase().includes("missing") ||
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("environment") ||
      message.toLowerCase().includes("not configured")
        ? 400
        : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

type InquiryPayload = {
  name: string;
  email: string;
  contactMethod: string;
  inquiryType: string;
  message: string;
  location?: string;
  preferredSize?: string;
};

function validatePayload(payload: Partial<InquiryPayload & { inquiryType: string; locale?: string }>) {
  const requiredFields: Array<keyof InquiryPayload> = [
    "name",
    "email",
    "contactMethod",
    "inquiryType",
    "message"
  ];

  for (const field of requiredFields) {
    const value = payload[field];
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Invalid or missing field: ${field}`);
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email!.trim())) {
    throw new Error("Invalid email format");
  }

  if (!isInquiryTypeKey(payload.inquiryType!.trim())) {
    throw new Error("Invalid inquiry type");
  }

  const inquiryTypeKey = payload.inquiryType!.trim() as InquiryTypeKey;
  const locale: "en" | "bg" = payload.locale === "bg" ? "bg" : "en";

  return {
    name: payload.name!.trim(),
    email: payload.email!.trim(),
    contactMethod: payload.contactMethod!.trim(),
    inquiryTypeKey,
    message: payload.message!.trim(),
    location: payload.location?.trim() || undefined,
    preferredSize: payload.preferredSize?.trim() || undefined,
    locale
  };
}
