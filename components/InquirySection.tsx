"use client";

import { FormEvent, useState } from "react";
import SectionHeading from "./SectionHeading";
import type { Locale } from "@/lib/i18n";

type InquiryState = "idle" | "loading" | "success" | "error";

type InquiryCopy = {
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
  submit: string;
  submitDisabled: string;
  errors: { submitFailed: string; generic: string };
  success: string;
};

const defaultForm = {
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
  const [status, setStatus] = useState<InquiryState>("idle");
  const [feedback, setFeedback] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

      const result = (await response.json()) as { ok: boolean; message: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.message || copy.errors.submitFailed);
      }

      setStatus("success");
      setFeedback(copy.success);
      setForm(defaultForm);
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : copy.errors.generic);
    }
  };

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
            Prefer WhatsApp?{" "}
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

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <input
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            name="website"
            value={form.website}
            onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
          />

          <Field label={copy.fields.name} required requiredMark={copy.fields.requiredMark}>
            <input
              className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
              name="name"
              autoComplete="name"
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </Field>

          <Field label={copy.fields.email} required requiredMark={copy.fields.requiredMark}>
            <input
              className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </Field>

          <Field label={copy.fields.contactMethod} required requiredMark={copy.fields.requiredMark}>
            <input
              className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
              name="contactMethod"
              placeholder={copy.fields.contactPlaceholder}
              required
              value={form.contactMethod}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, contactMethod: event.target.value }))
              }
            />
          </Field>

          <Field label={copy.fields.inquiryType} required requiredMark={copy.fields.requiredMark}>
            <select
              className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy.fields.locationOptional} requiredMark={copy.fields.requiredMark}>
              <input
                className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
                name="location"
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              />
            </Field>
            <Field label={copy.fields.preferredSizeOptional} requiredMark={copy.fields.requiredMark}>
              <input
                className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
                name="preferredSize"
                value={form.preferredSize}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, preferredSize: event.target.value }))
                }
              />
            </Field>
          </div>

          <Field label={copy.fields.message} required requiredMark={copy.fields.requiredMark}>
            <textarea
              className="focus-ring min-h-28 w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
              name="message"
              required
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            />
          </Field>

          <button
            type="submit"
            disabled={status === "loading"}
            className="focus-ring inline-flex min-h-11 items-center rounded-full bg-caramel px-6 py-3 text-sm font-medium text-ink transition hover:bg-caramel/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? `${copy.submit}…` : copy.submit}
          </button>

          {feedback ? (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm ${status === "error" ? "text-red-300" : "text-caramel"}`}
            >
              {feedback}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  requiredMark,
  children
}: {
  label: string;
  required?: boolean;
  requiredMark: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-[0.16em] text-mist">
        {label}
        {required ? ` ${requiredMark}` : ""}
      </span>
      {children}
    </label>
  );
}
