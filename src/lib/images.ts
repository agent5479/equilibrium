export interface ImageManifestEntry {
  webp: Record<string, string>;
  jpeg?: string;
}

import manifestData from "./image-manifest.json";

const manifest = manifestData as Record<string, ImageManifestEntry>;

/** PNG logos and icons — keep originals to preserve transparency */
const ORIGINAL_ONLY = new Set([
  "/assets/wp-content/uploads/2023/02/logo.png",
  "/assets/wp-content/uploads/2023/02/logo-300x240.png",
  "/assets/wp-content/uploads/2023/02/favicon.png",
]);

export function resolveOptimizedSrc(src: string): {
  src: string;
  srcSet?: string;
  type?: string;
} {
  if (!src || src.startsWith("http")) return { src };

  let key = src;
  if (key.startsWith("/equilibrium")) key = key.slice("/equilibrium".length);
  if (!key.startsWith("/assets")) key = key.startsWith("/") ? key : `/assets${key}`;

  if (ORIGINAL_ONLY.has(key)) {
    return { src: `/equilibrium${key}` };
  }

  const entry = manifest[key];
  if (!entry) {
    const publicSrc = key.startsWith("/assets") ? `/equilibrium${key}` : src;
    return { src: publicSrc };
  }

  const widths = Object.keys(entry.webp)
    .map(Number)
    .sort((a, b) => a - b);

  if (widths.length === 0) {
    return { src: entry.jpeg ? `/equilibrium${entry.jpeg}` : `/equilibrium${key}` };
  }

  const srcSet = widths
    .map((w) => `/equilibrium${entry.webp[String(w)]} ${w}w`)
    .join(", ");

  return {
    src: `/equilibrium${entry.jpeg || entry.webp[String(widths[widths.length - 1])]}`,
    srcSet,
    type: "image/webp",
  };
}
