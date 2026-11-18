"use client";

import { openCookieSettings } from "@/lib/legal/consent";

export default function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="focus-ring underline decoration-ivory/30 underline-offset-4 hover:text-ivory"
      onClick={openCookieSettings}
    >
      {label}
    </button>
  );
}
