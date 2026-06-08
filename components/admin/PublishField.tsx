"use client";

import type { ReactNode } from "react";

type PublishFieldProps = {
  fieldId?: string;
  label: string;
  invalid?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export default function PublishField({
  fieldId,
  label,
  invalid = false,
  hint,
  children,
  className = ""
}: PublishFieldProps) {
  return (
    <label id={fieldId} className={`block space-y-2 ${fieldId ? "scroll-mt-24" : ""} ${className}`}>
      <span className={`text-xs uppercase tracking-[0.16em] ${invalid ? "text-red-300" : "text-mist"}`}>
        {label}
        {invalid ? " · required" : ""}
      </span>
      <div
        className={
          invalid
            ? "rounded-xl ring-1 ring-red-400/50 [&_.admin-input]:border-red-400/50"
            : undefined
        }
      >
        {children}
      </div>
      {invalid && hint ? <p className="text-xs text-red-200/90">{hint}</p> : null}
    </label>
  );
}
