"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import RevealItem from "./RevealItem";
import SectionHeading from "./SectionHeading";
import InquirySuccessDialog from "./InquirySuccessDialog";
import {
  consumeInquiryPrefill,
  INQUIRY_PREFILL_EVENT,
  type InquiryPrefillDetail
} from "@/lib/inquiry-prefill";
import { clearInquiryCart } from "@/lib/inquiry-cart";
import type { Locale } from "@/lib/i18n";
import { inquiryPrivacyNotice } from "@/lib/legal/copy";

type InquiryState = "idle" | "loading" | "success" | "error";

type InquiryCopy = {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  statusAria: string;
  importantTitle: string;
  formNotActive: string;
  whatsappLead: string;
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
  submit: string;
  submitDisabled: string;
  errors: {
    submitFailed: string;
    generic: string;
    required: string;
    email: string;
    tooLong: string;
  };
  success: string;
  successPopup: {
    title: string;
    message: string;
    messageNoEmail: string;
    close: string;
  };
};

type FieldKey = "name" | "email" | "contactMethod" | "message" | "location" | "preferredSize";

function cleanLine(value: string) {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

type InquiryForm = {
  name: string;
  email: string;
  contactMethod: string;
  inquiryType: string;
  message: string;
  location: string;
  preferredSize: string;
  website: string;
};

function validateForm(form: InquiryForm, copy: InquiryCopy) {
  const errors: Partial<Record<FieldKey, string>> = {};
  const check = (key: FieldKey, label: string, value: string, max: number, multiline = false) => {
    const cleaned = multiline ? value.replace(/\u0000/g, "").trim() : cleanLine(value);
    if (!cleaned) errors[key] = copy.errors.required.replace("{field}", label);
    else if (cleaned.length > max) errors[key] = copy.errors.tooLong.replace("{field}", label);
    return cleaned;
  };

  check("name", copy.fields.name, form.name, 120);
  const email = check("email", copy.fields.email, form.email, 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = copy.errors.email;
  }
  check("contactMethod", copy.fields.contactMethod, form.contactMethod, 160);
  check("message", copy.fields.message, form.message, 4000, true);
  if (form.location.trim() && cleanLine(form.location).length > 160) {
    errors.location = copy.errors.tooLong.replace("{field}", copy.fields.locationOptional);
  }
  if (form.preferredSize.trim() && cleanLine(form.preferredSize).length > 80) {
    errors.preferredSize = copy.errors.tooLong.replace("{field}", copy.fields.preferredSizeOptional);
  }
  return errors;
}

const defaultForm: InquiryForm = {
  name: "",
  email: "",
  contactMethod: "",
  inquiryType: "availability",
  message: "",
  location: "",
  preferredSize: "",
  website: ""
};

export default function InquirySection({
  copy,
  locale
}: {
  copy: InquiryCopy;
  locale: Locale;
}) {
  const [form, setForm] = useState(defaultForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<InquiryState>("idle");
  const [feedback, setFeedback] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successDialogMessage, setSuccessDialogMessage] = useState("");
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const applyPrefill = (detail: InquiryPrefillDetail) => {
    setForm((prev) => ({
      ...prev,
      message: detail.message,
      inquiryType: detail.inquiryType ?? prev.inquiryType
    }));
    window.requestAnimationFrame(() => messageRef.current?.focus());
  };

  useEffect(() => {
    const onPrefill = (event: Event) => {
      applyPrefill((event as CustomEvent<InquiryPrefillDetail>).detail);
    };

    window.addEventListener(INQUIRY_PREFILL_EVENT, onPrefill);

    const stored = consumeInquiryPrefill();
    if (stored) applyPrefill(stored);

    return () => window.removeEventListener(INQUIRY_PREFILL_EVENT, onPrefill);
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateForm(form, copy);
    setFieldErrors(errors);
    const firstInvalid = (Object.keys(errors) as FieldKey[])[0];
    if (firstInvalid) {
      setStatus("idle");
      setFeedback("");
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          contactMethod: form.contactMethod,
          inquiryType: form.inquiryType,
          message: form.message,
          location: form.location,
          preferredSize: form.preferredSize,
          locale,
          website: form.website
        })
      });

      const result = (await response.json()) as {
        ok: boolean;
        message: string;
        emailed?: boolean;
      };
      if (!response.ok || !result.ok) {
        const serverMessage = result.message || "";
        const localized =
          serverMessage.startsWith("Invalid") || serverMessage === "Unable to send inquiry."
            ? copy.errors.submitFailed
            : serverMessage || copy.errors.submitFailed;
        throw new Error(localized);
      }

      setStatus("success");
      setSuccessDialogMessage(
        result.emailed ? copy.successPopup.message : copy.successPopup.messageNoEmail
      );
      setShowSuccessDialog(true);
      setForm(defaultForm);
      setFieldErrors({});
      clearInquiryCart();
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : copy.errors.generic);
    }
  };

  const notice = inquiryPrivacyNotice(locale);

  return (
    <section id="inquiry" className="border-y border-ivory/10 bg-[#0f0f0f] py-20 sm:py-24">
      <div className="container-luxury grid gap-10 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
          <p className="text-sm text-mist">{copy.note}</p>
          <p className="mt-4 text-sm text-mist">
            {copy.whatsappLead}{" "}
            <a
              href="https://wa.me/359887509906"
              target="_blank"
              rel="noreferrer"
              className="focus-ring underline decoration-caramel/70 underline-offset-4 hover:text-caramel"
            >
              +359887509906
            </a>{" "}
            {copy.or}{" "}
            <a
              href="https://wa.me/359887297480"
              target="_blank"
              rel="noreferrer"
              className="focus-ring underline decoration-caramel/70 underline-offset-4 hover:text-caramel"
            >
              +359887297480
            </a>
            .
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate> {/* Locale field messages replace the browser tooltip. */}
          <input
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            name="website"
            value={form.website}
            onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
          />

          <RevealItem index={0}>
          <Field
            id="name"
            label={copy.fields.name}
            required
            requiredMark={copy.fields.requiredMark}
            error={fieldErrors.name}
          >
            <input
              id="name"
              className={inputClass(Boolean(fieldErrors.name))}
              name="name"
              autoComplete="name"
              required
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              value={form.name}
              onChange={(event) => {
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
                setForm((prev) => ({ ...prev, name: event.target.value }));
              }}
            />
          </Field>
          </RevealItem>

          <RevealItem index={1}>
          <Field
            id="email"
            label={copy.fields.email}
            required
            requiredMark={copy.fields.requiredMark}
            error={fieldErrors.email}
          >
            <input
              id="email"
              className={inputClass(Boolean(fieldErrors.email))}
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              value={form.email}
              onChange={(event) => {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
                setForm((prev) => ({ ...prev, email: event.target.value }));
              }}
            />
          </Field>
          </RevealItem>

          <RevealItem index={2}>
          <Field
            id="contactMethod"
            label={copy.fields.contactMethod}
            required
            requiredMark={copy.fields.requiredMark}
            error={fieldErrors.contactMethod}
          >
            <input
              id="contactMethod"
              className={inputClass(Boolean(fieldErrors.contactMethod))}
              name="contactMethod"
              placeholder={copy.fields.contactPlaceholder}
              required
              aria-invalid={Boolean(fieldErrors.contactMethod)}
              aria-describedby={fieldErrors.contactMethod ? "contactMethod-error" : undefined}
              value={form.contactMethod}
              onChange={(event) => {
                setFieldErrors((prev) => ({ ...prev, contactMethod: undefined }));
                setForm((prev) => ({ ...prev, contactMethod: event.target.value }));
              }}
            />
          </Field>
          </RevealItem>

          <RevealItem index={3}>
          <Field id="inquiryType" label={copy.fields.inquiryType} required requiredMark={copy.fields.requiredMark}>
            <select
              id="inquiryType"
              className={inputClass(false)}
              name="inquiryType"
              required
              value={form.inquiryType}
              onChange={(event) => setForm((prev) => ({ ...prev, inquiryType: event.target.value }))}
            >
              <option value="availability" className="bg-ink text-ivory">
                {copy.inquiryTypes.availability}
              </option>
              <option value="customRequest" className="bg-ink text-ivory">
                {copy.inquiryTypes.customRequest}
              </option>
              <option value="deliveryQuestion" className="bg-ink text-ivory">
                {copy.inquiryTypes.deliveryQuestion}
              </option>
              <option value="personalization" className="bg-ink text-ivory">
                {copy.inquiryTypes.personalization}
              </option>
              <option value="general" className="bg-ink text-ivory">
                {copy.inquiryTypes.general}
              </option>
            </select>
          </Field>
          </RevealItem>

          <RevealItem index={4}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="location"
              label={copy.fields.locationOptional}
              requiredMark={copy.fields.requiredMark}
              error={fieldErrors.location}
            >
              <input
                id="location"
                className={inputClass(Boolean(fieldErrors.location))}
                name="location"
                aria-invalid={Boolean(fieldErrors.location)}
                aria-describedby={fieldErrors.location ? "location-error" : undefined}
                value={form.location}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, location: undefined }));
                  setForm((prev) => ({ ...prev, location: event.target.value }));
                }}
              />
            </Field>
            <Field
              id="preferredSize"
              label={copy.fields.preferredSizeOptional}
              requiredMark={copy.fields.requiredMark}
              error={fieldErrors.preferredSize}
            >
              <input
                id="preferredSize"
                className={inputClass(Boolean(fieldErrors.preferredSize))}
                name="preferredSize"
                aria-invalid={Boolean(fieldErrors.preferredSize)}
                aria-describedby={fieldErrors.preferredSize ? "preferredSize-error" : undefined}
                value={form.preferredSize}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, preferredSize: undefined }));
                  setForm((prev) => ({ ...prev, preferredSize: event.target.value }));
                }}
              />
            </Field>
          </div>
          </RevealItem>

          <RevealItem index={5}>
          <Field
            id="message"
            label={copy.fields.message}
            required
            requiredMark={copy.fields.requiredMark}
            error={fieldErrors.message}
          >
            <textarea
              id="message"
              ref={messageRef}
              className={`${inputClass(Boolean(fieldErrors.message))} min-h-48`}
              name="message"
              required
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={fieldErrors.message ? "message-error" : undefined}
              value={form.message}
              onChange={(event) => {
                setFieldErrors((prev) => ({ ...prev, message: undefined }));
                setForm((prev) => ({ ...prev, message: event.target.value }));
              }}
            />
          </Field>
          </RevealItem>

          <p className="text-xs leading-relaxed text-mist">
            {notice.before}{" "}
            <a
              href={`/${locale}/privacy`}
              className="focus-ring underline decoration-caramel/70 underline-offset-4 hover:text-caramel"
            >
              {notice.privacy}
            </a>{" "}
            {notice.and}{" "}
            <a
              href={`/${locale}/terms`}
              className="focus-ring underline decoration-caramel/70 underline-offset-4 hover:text-caramel"
            >
              {notice.terms}
            </a>
            .
          </p>

          <button
            type="submit"
            disabled={status === "loading"}
            className="focus-ring inline-flex min-h-11 items-center rounded-full bg-caramel px-6 py-3 text-sm font-medium text-ink transition-[color,background-color,transform] duration-100 ease-out hover:bg-caramel/90 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
          >
            {status === "loading" ? `${copy.submit}…` : copy.submit}
          </button>

          {feedback && status === "error" ? (
            <p role="alert" className="text-sm text-red-300">
              {feedback}
            </p>
          ) : null}
        </form>
      </div>

      <InquirySuccessDialog
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          setStatus("idle");
        }}
        copy={{
          ...copy.successPopup,
          message: successDialogMessage || copy.successPopup.message
        }}
      />
    </section>
  );
}

function inputClass(invalid: boolean) {
  return `focus-ring w-full rounded-xl border bg-transparent px-4 py-3 text-sm ${
    invalid ? "border-red-300/80" : "border-ivory/20"
  }`;
}

function Field({
  id,
  label,
  required,
  requiredMark,
  error,
  children
}: {
  id: string;
  label: string;
  required?: boolean;
  requiredMark: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block space-y-1.5">
      <label htmlFor={id} className="text-xs uppercase tracking-[0.16em] text-mist">
        {label}
        {required ? ` ${requiredMark}` : ""}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
