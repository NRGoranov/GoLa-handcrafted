"use client";

import type { PublishIssue } from "@/lib/admin/publish-validation";
import { scrollToPublishField } from "@/lib/admin/publish-validation";

type PublishIssuesPanelProps = {
  issues: PublishIssue[];
  title?: string;
};

export default function PublishIssuesPanel({
  issues,
  title = "Complete these before publishing"
}: PublishIssuesPanelProps) {
  if (issues.length === 0) return null;

  return (
    <div
      id="publish-issues-panel"
      className="rounded-xl border border-red-400/35 bg-red-950/25 p-4"
      role="alert"
    >
      <p className="text-sm font-medium text-red-100">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {issues.map((issue) => (
          <li key={`${issue.fieldId}-${issue.label}`}>
            <button
              type="button"
              onClick={() => scrollToPublishField(issue.fieldId)}
              className="group flex w-full items-start gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-red-900/30"
            >
              <span className="mt-0.5 text-red-300" aria-hidden>
                →
              </span>
              <span className="min-w-0">
                <span className="text-sm text-ivory group-hover:text-caramel">{issue.label}</span>
                <span className="mt-0.5 block text-xs text-red-200/90">{issue.message}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
