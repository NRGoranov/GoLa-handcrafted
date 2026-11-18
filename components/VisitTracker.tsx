"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_CHANGED_EVENT, readConsentChoice, type ConsentChoice } from "@/lib/legal/consent";

export default function VisitTracker() {
  const pathname = usePathname();
  const skippedEssential = useRef(false);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const report = (choice: ConsentChoice | null) => {
      if (choice === "essential") {
        if (skippedEssential.current) return;
        skippedEssential.current = true;
      } else {
        skippedEssential.current = false;
      }
      if (choice !== "all" && choice !== "essential") return;
      void fetch("/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, consent: choice }),
        keepalive: true
      }).catch(() => {});
    };

    report(readConsentChoice());

    const onChange = () => report(readConsentChoice());
    window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  }, [pathname]);

  return null;
}
