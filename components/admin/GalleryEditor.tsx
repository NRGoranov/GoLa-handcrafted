"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminImage from "@/components/admin/AdminImage";
import DragSortList, { DragHandle } from "@/components/admin/DragSortList";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { GalleryGroupRecord } from "@/types/gallery-record";

type GalleryEditorProps = {
  onUpdated?: () => void;
};

function imageDraftKey(groupId: string, index: number) {
  return `${groupId}:${index}`;
}

export default function GalleryEditor({ onUpdated }: GalleryEditorProps) {
  const [groups, setGroups] = useState<GalleryGroupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [imageUrlDrafts, setImageUrlDrafts] = useState<Record<string, string>>({});
  const [replacing, setReplacing] = useState(false);
  const replaceTargetRef = useRef<{ groupId: string; index: number } | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/gallery", { cache: "no-store" });
    const result = (await response.json()) as { ok: boolean; records?: GalleryGroupRecord[] };
    if (result.ok && result.records) {
      setGroups(result.records);
      setExpandedId((current) => current ?? result.records![0]?.id ?? null);
      setImageUrlDrafts({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const notify = (text: string) => {
    setMessage(text);
    onUpdated?.();
  };

  const saveGroup = async (group: GalleryGroupRecord) => {
    const response = await fetch(`/api/admin/gallery/groups/${group.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        labelEn: group.labelEn,
        labelBg: group.labelBg,
        images: group.images
      })
    });
    const result = (await response.json()) as { ok: boolean; group?: GalleryGroupRecord; message?: string };
    if (!response.ok || !result.ok || !result.group) {
      throw new Error(result.message || "Unable to save gallery group.");
    }
    setGroups((prev) => prev.map((entry) => (entry.id === result.group!.id ? result.group! : entry)));
    setImageUrlDrafts({});
    notify("Gallery saved.");
  };

  const syncFolderPhotos = async () => {
    setSyncing(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" })
      });
      const result = (await response.json()) as {
        ok: boolean;
        records?: GalleryGroupRecord[];
        imageCount?: number;
        message?: string;
      };
      if (!response.ok || !result.ok || !result.records) {
        throw new Error(result.message || "Unable to import folder photos.");
      }
      setGroups(result.records);
      notify(`Imported folder photos (${result.imageCount ?? 0} total).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to import folder photos.");
    } finally {
      setSyncing(false);
    }
  };

  const reorderGroups = async (orderedIds: string[]) => {
    const response = await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupIds: orderedIds })
    });
    const result = (await response.json()) as { ok: boolean; records?: GalleryGroupRecord[]; message?: string };
    if (!response.ok || !result.ok || !result.records) {
      setMessage(result.message || "Unable to reorder groups.");
      return;
    }
    setGroups(result.records);
    notify("Group order saved.");
  };

  const addGroup = async () => {
    const response = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labelEn: "New group", labelBg: "Нова група" })
    });
    const result = (await response.json()) as { ok: boolean; group?: GalleryGroupRecord; message?: string };
    if (!response.ok || !result.ok || !result.group) {
      setMessage(result.message || "Unable to add group.");
      return;
    }
    setGroups((prev) => [...prev, result.group!]);
    setExpandedId(result.group.id);
    notify("Group added.");
  };

  const removeGroup = async (id: string) => {
    if (!window.confirm("Delete this gallery group and all its photos?")) return;
    const response = await fetch(`/api/admin/gallery/groups/${id}`, { method: "DELETE" });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Unable to delete group.");
      return;
    }
    setGroups((prev) => prev.filter((group) => group.id !== id));
    if (expandedId === id) setExpandedId(null);
    notify("Group deleted.");
  };

  const uploadImage = async (groupId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "gallery");
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const result = (await response.json()) as { ok: boolean; url?: string; message?: string };
    if (!response.ok || !result.ok || !result.url) {
      throw new Error(result.message || "Upload failed.");
    }

    const group = groups.find((entry) => entry.id === groupId);
    if (!group) return;
    await saveGroup({ ...group, images: [...group.images, result.url] });
  };

  const addImageUrl = async (groupId: string) => {
    const url = urlInputs[groupId]?.trim();
    if (!url) return;
    const group = groups.find((entry) => entry.id === groupId);
    if (!group) return;
    await saveGroup({ ...group, images: [...group.images, url] });
    setUrlInputs((prev) => ({ ...prev, [groupId]: "" }));
  };

  const updateImageAtIndex = async (groupId: string, index: number, nextUrl: string) => {
    const group = groups.find((entry) => entry.id === groupId);
    if (!group) return;
    const trimmed = nextUrl.trim();
    if (!trimmed || trimmed === group.images[index]) return;

    const images = [...group.images];
    images[index] = trimmed;
    await saveGroup({ ...group, images });
  };

  const moveImage = async (groupId: string, index: number, direction: -1 | 1) => {
    const group = groups.find((entry) => entry.id === groupId);
    if (!group) return;
    const target = index + direction;
    if (target < 0 || target >= group.images.length) return;

    const images = [...group.images];
    [images[index], images[target]] = [images[target], images[index]];
    await saveGroup({ ...group, images });
  };

  const removeImageAtIndex = async (groupId: string, index: number) => {
    const group = groups.find((entry) => entry.id === groupId);
    if (!group) return;
    await saveGroup({ ...group, images: group.images.filter((_, imageIndex) => imageIndex !== index) });
  };

  const startReplaceImage = (groupId: string, index: number) => {
    replaceTargetRef.current = { groupId, index };
    replaceInputRef.current?.click();
  };

  const onReplaceFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const target = replaceTargetRef.current;
    replaceTargetRef.current = null;
    if (!file || !target) return;

    setReplacing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "gallery");
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const result = (await response.json()) as { ok: boolean; url?: string; message?: string };
      if (!response.ok || !result.ok || !result.url) {
        throw new Error(result.message || "Upload failed.");
      }

      const group = groups.find((entry) => entry.id === target.groupId);
      if (!group) return;
      const images = [...group.images];
      images[target.index] = result.url;
      await saveGroup({ ...group, images });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to replace image.");
    } finally {
      setReplacing(false);
    }
  };

  const patchGroup = (groupId: string, patch: Partial<GalleryGroupRecord>) => {
    setGroups((prev) => prev.map((group) => (group.id === groupId ? { ...group, ...patch } : group)));
  };

  if (loading) {
    return <p className="text-sm text-mist">Loading gallery…</p>;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-ivory/10 bg-[#111] p-5">
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void onReplaceFile(e)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-caramel">Gallery sections & photos</p>
          <p className="mt-1 text-sm text-mist">
            Edit each photo&apos;s URL, replace files, reorder, or remove. Drag sections to reorder the modal.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void syncFolderPhotos()}
            disabled={syncing}
            className="rounded-full border border-ivory/15 px-4 py-2 text-xs text-mist hover:border-caramel/40 hover:text-ivory disabled:opacity-60"
          >
            {syncing ? "Importing…" : "Import folder photos"}
          </button>
          <button
            type="button"
            onClick={() => void addGroup()}
            className="rounded-full bg-caramel px-4 py-2 text-xs font-medium text-ink"
          >
            + Add section
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-mist">No gallery sections yet. Add one or import folder photos to get started.</p>
      ) : (
        <DragSortList
          items={groups}
          onReorder={reorderGroups}
          renderItem={(group, index, { dragHandleProps }) => {
            const expanded = expandedId === group.id;
            return (
              <div className="rounded-xl border border-ivory/10 bg-[#0d0d0d]">
                <div className="flex items-center gap-2 p-3">
                  <DragHandle dragHandleProps={dragHandleProps} />
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ivory/15 text-[11px] text-mist">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : group.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium text-ivory">{group.labelEn || group.id}</p>
                    <p className="truncate text-xs text-mist">
                      {group.labelBg} · {group.images.length} photos
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeGroup(group.id)}
                    className="text-[10px] text-red-300 underline"
                  >
                    Delete
                  </button>
                </div>

                {expanded ? (
                  <div className="space-y-4 border-t border-ivory/10 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className="admin-input w-full"
                        placeholder="Section title (English)"
                        value={group.labelEn}
                        onChange={(e) => patchGroup(group.id, { labelEn: e.target.value })}
                        onBlur={(e) => void saveGroup({ ...group, labelEn: e.target.value })}
                      />
                      <input
                        className="admin-input w-full"
                        placeholder="Section title (Bulgarian)"
                        value={group.labelBg}
                        onChange={(e) => patchGroup(group.id, { labelBg: e.target.value })}
                        onBlur={(e) => void saveGroup({ ...group, labelBg: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                      <input
                        className="admin-input min-w-0 flex-1"
                        placeholder="Paste image URL"
                        value={urlInputs[group.id] ?? ""}
                        onChange={(e) =>
                          setUrlInputs((prev) => ({ ...prev, [group.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void addImageUrl(group.id);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => void addImageUrl(group.id)}
                        className="rounded-full border border-caramel/40 px-4 py-2 text-xs text-caramel"
                      >
                        Add URL
                      </button>
                    </div>

                    <ImageUploadField
                      label="Upload photo"
                      onUpload={(file) => uploadImage(group.id, file)}
                    />

                    {group.images.length > 0 ? (
                      <div className="overflow-hidden rounded-xl border border-ivory/10 bg-black/20">
                        <p className="border-b border-ivory/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-mist">
                          Photos · {group.images.length}
                        </p>
                        <div className="grid max-h-[min(48vh,480px)] grid-cols-2 gap-3 overflow-y-auto overscroll-contain p-3 sm:grid-cols-3">
                          {group.images.map((url, imageIndex) => {
                            const draftKey = imageDraftKey(group.id, imageIndex);
                            return (
                              <div
                                key={`${group.id}-${imageIndex}-${url}`}
                                className="overflow-hidden rounded-xl border border-ivory/10 bg-[#0a0a0a]"
                              >
                                <div className="relative aspect-[4/5]">
                                  <AdminImage src={url} alt="" fill className="object-cover" sizes="160px" />
                                </div>
                                <div className="space-y-2 border-t border-ivory/10 p-2">
                                  <input
                                    className="admin-input w-full text-[10px]"
                                    value={imageUrlDrafts[draftKey] ?? url}
                                    onChange={(e) =>
                                      setImageUrlDrafts((prev) => ({ ...prev, [draftKey]: e.target.value }))
                                    }
                                    onBlur={(e) => void updateImageAtIndex(group.id, imageIndex, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        void updateImageAtIndex(
                                          group.id,
                                          imageIndex,
                                          imageUrlDrafts[draftKey] ?? url
                                        );
                                      }
                                    }}
                                  />
                                  <div className="flex flex-wrap gap-1">
                                    <button
                                      type="button"
                                      disabled={replacing}
                                      onClick={() => startReplaceImage(group.id, imageIndex)}
                                      className="rounded-full border border-caramel/40 px-2 py-0.5 text-[10px] text-caramel hover:bg-caramel/10 disabled:opacity-50"
                                    >
                                      Replace
                                    </button>
                                    <button
                                      type="button"
                                      disabled={imageIndex === 0}
                                      onClick={() => void moveImage(group.id, imageIndex, -1)}
                                      className="rounded-full border border-ivory/15 px-2 py-0.5 text-[10px] text-mist disabled:opacity-30"
                                      aria-label="Move earlier"
                                    >
                                      ←
                                    </button>
                                    <button
                                      type="button"
                                      disabled={imageIndex === group.images.length - 1}
                                      onClick={() => void moveImage(group.id, imageIndex, 1)}
                                      className="rounded-full border border-ivory/15 px-2 py-0.5 text-[10px] text-mist disabled:opacity-30"
                                      aria-label="Move later"
                                    >
                                      →
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void removeImageAtIndex(group.id, imageIndex)}
                                      className="ml-auto rounded-full bg-red-950/80 px-2 py-0.5 text-[10px] text-red-200"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-mist">No photos in this section yet.</p>
                    )}
                  </div>
                ) : null}
              </div>
            );
          }}
        />
      )}

      {message ? <p className="text-sm text-caramel">{message}</p> : null}
    </section>
  );
}
