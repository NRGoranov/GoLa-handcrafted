"use client";

import { OPEN_CONSENT_EVENT } from "@/lib/analytics-consent";

export default function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="focus-ring underline decoration-caramel/40 underline-offset-4 hover:text-ivory"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
    >
      {label}
    </button>
  );
}
