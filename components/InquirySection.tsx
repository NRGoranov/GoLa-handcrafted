"use client";

import { FormEvent, useState } from "react";
import SectionHeading from "./SectionHeading";

type InquiryState = "idle" | "loading" | "success" | "error";

const inquiryTypes = [
  "Availability",
  "Custom Request",
  "Delivery Question",
  "Personalization",
  "General"
] as const;

const defaultForm = {
  name: "",
  email: "",
  contactMethod: "",
  inquiryType: "Availability",
  message: "",
  location: "",
  preferredSize: ""
};

export default function InquirySection() {
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
        body: JSON.stringify(form)
      });

      const result = (await response.json()) as { ok: boolean; message: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Unable to submit inquiry.");
      }

      setStatus("success");
      setFeedback("Thank you. Your inquiry has been received.");
      setForm(defaultForm);
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  return (
    <section id="inquiry" className="border-y border-ivory/10 bg-[#101010] py-20 sm:py-24">
      <div className="container-luxury grid gap-10 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Inquiry"
            title="Begin Your Request"
            description="Share your preferences and we will respond with availability, lead time, and bespoke possibilities."
          />
          <p className="text-sm text-mist">
            This studio works by inquiry only. Each response is tailored to your request.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div
            className="rounded-xl border border-caramel/50 bg-caramel/10 px-4 py-3 text-sm text-ivory"
            role="note"
            aria-label="Inquiry form status notice"
          >
            <p className="font-medium text-caramel">Important</p>
            <p className="mt-1 text-ivory/90">
              The website form is not active yet. Please contact us on WhatsApp at{" "}
              <a
                href="https://wa.me/359887509906"
                target="_blank"
                rel="noreferrer"
                className="focus-ring underline decoration-caramel/70 underline-offset-4 hover:text-caramel"
              >
                +359887509906
              </a>
              {" "}or{" "}
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

          <Field label="Name" required>
            <input
              className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
              name="name"
              autoComplete="name"
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </Field>

          <Field label="Email" required>
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

          <Field label="Contact method" required>
            <input
              className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
              name="contactMethod"
              placeholder="Email, WhatsApp, Phone..."
              required
              value={form.contactMethod}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, contactMethod: event.target.value }))
              }
            />
          </Field>

          <Field label="Inquiry type" required>
            <select
              className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
              name="inquiryType"
              required
              value={form.inquiryType}
              onChange={(event) => setForm((prev) => ({ ...prev, inquiryType: event.target.value }))}
            >
              {inquiryTypes.map((item) => (
                <option key={item} value={item} className="bg-ink text-ivory">
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location (optional)">
              <input
                className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
                name="location"
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              />
            </Field>
            <Field label="Preferred size (optional)">
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

          <Field label="Message" required>
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
            disabled
            aria-disabled="true"
            className="focus-ring inline-flex min-h-11 items-center rounded-full bg-caramel/55 px-6 py-3 text-sm font-medium text-ink/80 disabled:cursor-not-allowed disabled:opacity-90"
          >
            Form Temporarily Unavailable
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
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-[0.16em] text-mist">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
