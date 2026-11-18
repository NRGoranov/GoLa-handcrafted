"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ANALYTICS_CONSENT_EVENT, readAnalyticsConsent } from "@/lib/analytics-consent";

function sendVisit(pathname: string) {
  if (readAnalyticsConsent() !== "accepted") return;
  if (!pathname || pathname.startsWith("/admin")) return;

  void fetch("/api/analytics/visit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-analytics-consent": "accepted"
    },
    body: JSON.stringify({ path: pathname }),
    keepalive: true
  }).catch(() => {});
}

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    sendVisit(pathname);
    const onConsent = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail === "accepted") {
        sendVisit(pathname);
        return;
      }
      void fetch("/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true
      }).catch(() => {});
    };
    window.addEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
  }, [pathname]);

  return null;
}
