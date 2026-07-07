"use client";

type UnsavedChangesDialogProps = {
  open: boolean;
  supportsDraft: boolean;
  saving: boolean;
  onSaveAndPublish: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

export default function UnsavedChangesDialog({
  open,
  supportsDraft,
  saving,
  onSaveAndPublish,
  onSaveDraft,
  onDiscard,
  onCancel
}: UnsavedChangesDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      onClick={saving ? undefined : onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        className="w-full max-w-md rounded-2xl border border-ivory/15 bg-[#111] p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="unsaved-changes-title" className="font-serif text-2xl text-ivory">
          Unsaved changes
        </h2>
        <p className="mt-2 text-sm text-mist">
          You have edits that are not saved yet. Save before leaving, or discard them.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onSaveAndPublish}
            className="rounded-full bg-caramel px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
          >
            {saving ? "Saving…" : supportsDraft ? "Save & publish" : "Save changes"}
          </button>
          {supportsDraft ? (
            <button
              type="button"
              disabled={saving}
              onClick={onSaveDraft}
              className="rounded-full border border-caramel/50 px-5 py-2.5 text-sm text-caramel disabled:opacity-60"
            >
              Save draft
            </button>
          ) : null}
          <button
            type="button"
            disabled={saving}
            onClick={onDiscard}
            className="rounded-full border border-ivory/15 px-5 py-2.5 text-sm text-mist hover:border-red-400/40 hover:text-red-200 disabled:opacity-60"
          >
            Don&apos;t save
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="mt-1 text-sm text-mist underline decoration-ivory/20 underline-offset-2 hover:text-ivory disabled:opacity-60"
          >
            Keep editing
          </button>
        </div>
      </div>
    </div>
  );
}
