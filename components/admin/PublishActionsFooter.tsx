"use client";

import PublishIssuesPanel from "@/components/admin/PublishIssuesPanel";
import type { PublishIssue } from "@/lib/admin/publish-validation";

type PublishActionsFooterProps = {
  published: boolean;
  onPublishedChange: (next: boolean) => void;
  requirementsHint: string;
  issues: PublishIssue[];
  status: "idle" | "saving" | "success" | "error";
  message: string;
};

export default function PublishActionsFooter({
  published,
  onPublishedChange,
  requirementsHint,
  issues,
  status,
  message
}: PublishActionsFooterProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-ivory/10 bg-[#111] p-5">
      <div id="field-published" className="scroll-mt-24">
        <label className="flex items-center gap-3 text-sm text-mist">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => onPublishedChange(event.target.checked)}
          />
          Published on site
        </label>
        <p className="mt-1 text-xs text-mist">{requirementsHint}</p>
        {!published ? (
          <p className="mt-2 text-xs text-caramel/90">
            Drafts are saved to the database but stay hidden on the public site until you check Published on site.
          </p>
        ) : null}
      </div>

      <PublishIssuesPanel issues={issues} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-full bg-caramel px-6 py-3 text-sm font-medium text-ink disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : published ? "Save & publish" : "Save draft"}
        </button>
        {message ? (
          <p className={`text-sm ${status === "error" ? "text-red-300" : "text-caramel"}`}>{message}</p>
        ) : null}
      </div>
    </section>
  );
}
