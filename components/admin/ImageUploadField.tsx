"use client";

import { useRef, useState } from "react";

type ImageUploadFieldProps = {
  label?: string;
  hint?: string;
  accept?: string;
  disabled?: boolean;
  onUpload: (file: File) => Promise<void>;
};

export default function ImageUploadField({
  label = "Add image",
  hint = "Choose a JPEG, PNG, WebP, or GIF file from your computer. It uploads to Supabase storage and appears in the list above.",
  accept = "image/jpeg,image/png,image/webp,image/gif",
  disabled = false,
  onUpload
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const openPicker = () => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  };

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setStatus("");
    try {
      await onUpload(file);
      setStatus("Image added.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative rounded-xl border border-dashed border-ivory/15 bg-black/20 p-4">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled || uploading}
        tabIndex={-1}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        onChange={(e) => void onChange(e)}
      />
      <p className="text-sm font-medium text-ivory">{label}</p>
      <p className="mt-1 text-xs text-mist">{hint}</p>
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled || uploading}
        className="mt-3 inline-flex rounded-full bg-caramel px-4 py-2 text-sm font-medium text-ink disabled:opacity-60"
      >
        {uploading ? "Uploading…" : "Choose file"}
      </button>
      {status ? <p className="mt-2 text-xs text-caramel">{status}</p> : null}
    </div>
  );
}
