"use client";

import { useEffect, useState } from "react";
import { assemblyFinished, replayAssembly } from "@/lib/hero-sequence";

export default function ScrollToTopButton({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(assemblyFinished());

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const onClick = () => replayAssembly();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "focus-ring fixed bottom-6 right-6 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full",
        "border border-ivory/15 bg-ink/60 text-ivory shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        "hover:-translate-y-0.5 hover:border-caramel/50 hover:bg-caramel/15 hover:text-caramel",
        "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-3 scale-95 opacity-0"
      ].join(" ")}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 drop-shadow-[0_0_8px_rgba(183,139,90,0.35)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}

