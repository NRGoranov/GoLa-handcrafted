import fs from "fs";
import path from "path";
import {
  galleryGroupKeyForFolder,
  galleryGroupSortIndex,
  resolveGalleryGroupLabel
} from "./galleryFolderMap";
import { type GalleryGroupLabels, type GalleryImageGroup } from "./galleryTypes";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function toPublicUrlPath(absolutePath: string): string {
  const publicRoot = path.join(process.cwd(), "public");
  const relative = path.relative(publicRoot, absolutePath);
  return `/${relative.split(path.sep).map((segment) => encodeURIComponent(segment)).join("/")}`;
}

function formatUnknownFolderLabel(relativeDir: string): string {
  return relativeDir
    .split(path.sep)
    .map((segment) => decodeURIComponent(segment))
    .join(" · ");
}

type GroupAccumulator = {
  id: string;
  relativeDir: string;
  images: string[];
};

function collectGroupedImages(
  galleryRoot: string,
  groups: Map<string, GroupAccumulator>
): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(galleryRoot, { withFileTypes: true });
  } catch {
    return;
  }

  const galleryBase = path.join(process.cwd(), "public", "images", "gallery");

  for (const entry of entries) {
    const fullPath = path.join(galleryRoot, entry.name);
    if (entry.isDirectory()) {
      collectGroupedImages(fullPath, groups);
      continue;
    }
    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;

    const relativeDir = path.relative(galleryBase, path.dirname(fullPath));
    const groupKey = galleryGroupKeyForFolder(relativeDir);
    const mapKey = String(groupKey);

    const existing = groups.get(mapKey);
    if (existing) {
      existing.images.push(toPublicUrlPath(fullPath));
    } else {
      groups.set(mapKey, {
        id: mapKey,
        relativeDir,
        images: [toPublicUrlPath(fullPath)]
      });
    }
  }
}

/**
 * Images under `public/images/gallery`, grouped by subfolder with localized labels.
 */
export function getGalleryGroups(labels: GalleryGroupLabels): GalleryImageGroup[] {
  const galleryRoot = path.join(process.cwd(), "public", "images", "gallery");
  const byGroup = new Map<string, GroupAccumulator>();
  collectGroupedImages(galleryRoot, byGroup);

  return Array.from(byGroup.values())
    .map((group) => ({
      id: group.id,
      label: resolveGalleryGroupLabel(
        group.id,
        group.relativeDir,
        labels,
        formatUnknownFolderLabel
      ),
      images: group.images.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    }))
    .sort((a, b) => {
      const order = galleryGroupSortIndex(a.id) - galleryGroupSortIndex(b.id);
      if (order !== 0) return order;
      return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
    });
}

/** Flat list (preview order follows group order). */
export function getGalleryImagePaths(labels: GalleryGroupLabels): string[] {
  return getGalleryGroups(labels).flatMap((group) => group.images);
}
