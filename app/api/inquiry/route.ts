import { NextResponse } from "next/server";
import { isSmtpConfigured, sendInquiryMail } from "@/lib/mail";
import { saveInquiry } from "@/lib/inquiries/store";
import { allowRequest, clientRateKey } from "@/lib/http/rate-limit";
import {
  INQUIRY_TYPE_LABELS,
  isInquiryTypeKey,
  type InquiryTypeKey
} from "@/lib/inquiries/types";

export async function POST(req: Request) {
  if (!allowRequest(clientRateKey(req, "inquiry"), 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, message: "Too many inquiries from this network. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as Partial<
      InquiryPayload & { inquiryType: string; locale?: string; website?: string }
    >;

    if (body.website) {
      return NextResponse.json({ ok: false, message: "Invalid submission." }, { status: 400 });
    }

    const validated = validatePayload(body);
    const inquiryTypeLabel = INQUIRY_TYPE_LABELS[validated.inquiryTypeKey];
    const inquiry = {
      name: validated.name,
      email: validated.email,
      contactMethod: validated.contactMethod,
      inquiryType: inquiryTypeLabel,
      message: validated.message,
      location: validated.location,
      preferredSize: validated.preferredSize,
      locale: validated.locale
    };

    const saved = await saveInquiry({
      name: inquiry.name,
      email: inquiry.email,
      contactMethod: inquiry.contactMethod,
      inquiryType: validated.inquiryTypeKey,
      inquiryTypeLabel,
      message: inquiry.message,
      location: inquiry.location ?? null,
      preferredSize: inquiry.preferredSize ?? null,
      locale: inquiry.locale
    });

    let emailed = false;
    if (isSmtpConfigured()) {
      try {
        await sendInquiryMail(inquiry);
        emailed = true;
      } catch (error) {
        console.error("Inquiry email failed.", error);
        if (!saved) throw error;
      }
    }

    if (!saved && !emailed) {
      console.error("Inquiry was not stored and email was not sent.");
      throw new Error("Unable to send inquiry.");
    }

    return NextResponse.json({
      ok: true,
      emailed,
      message: emailed
        ? "Inquiry sent successfully."
        : "Inquiry received. Email will be enabled once SMTP is configured."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const isClientError =
      message.startsWith("Invalid or missing field:") ||
      message === "Invalid email format" ||
      message === "Invalid inquiry type";
    return NextResponse.json(
      {
        ok: false,
        message: isClientError ? message : "Unable to send inquiry."
      },
      { status: isClientError ? 400 : 500 }
    );
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

  const name = oneLine(payload.name!, "name", 120);
  const email = oneLine(payload.email!, "email", 254);
  const contactMethod = oneLine(payload.contactMethod!, "contactMethod", 160);
  const message = payload.message!.replace(/\u0000/g, "").trim();
  if (!message || message.length > 4000) {
    throw new Error("Invalid or missing field: message");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email format");
  }

  if (!isInquiryTypeKey(payload.inquiryType!.trim())) {
    throw new Error("Invalid inquiry type");
  }

  const inquiryTypeKey = payload.inquiryType!.trim() as InquiryTypeKey;
  const locale: "en" | "bg" = payload.locale === "bg" ? "bg" : "en";

  return {
    name,
    email,
    contactMethod,
    inquiryTypeKey,
    message,
    location: optionalLine(payload.location, "location", 160),
    preferredSize: optionalLine(payload.preferredSize, "preferredSize", 80),
    locale
  };
}

function oneLine(value: string, field: string, max: number): string {
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!cleaned || cleaned.length > max) {
    throw new Error(`Invalid or missing field: ${field}`);
  }
  return cleaned;
}

function optionalLine(value: string | undefined, field: string, max: number): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return oneLine(value, field, max);
}
