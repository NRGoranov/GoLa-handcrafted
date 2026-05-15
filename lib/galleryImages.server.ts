import fs from "fs";
import path from "path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function toPublicUrlPath(absolutePath: string): string {
  const publicRoot = path.join(process.cwd(), "public");
  const relative = path.relative(publicRoot, absolutePath);
  return `/${relative.split(path.sep).map((segment) => encodeURIComponent(segment)).join("/")}`;
}

function collectImagePaths(dir: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectImagePaths(fullPath, out);
      continue;
    }
    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;

    out.push(toPublicUrlPath(fullPath));
  }
}

/**
 * Every image under `public/images/gallery`, including nested folders, sorted for stable order.
 */
export function getGalleryImagePaths(): string[] {
  const galleryRoot = path.join(process.cwd(), "public", "images", "gallery");
  const paths: string[] = [];
  collectImagePaths(galleryRoot, paths);
  return paths.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}
