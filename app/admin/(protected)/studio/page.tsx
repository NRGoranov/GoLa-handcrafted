import { Suspense } from "react";
import ContentStudio from "@/components/admin/ContentStudio";
import { getStorageMode } from "@/lib/content/sections-store";

export default function ContentStudioPage() {
  const storageMode = getStorageMode();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-sm text-mist">
          Loading content studio…
        </div>
      }
    >
      <ContentStudio storageMode={storageMode} />
    </Suspense>
  );
}
