export interface ImageManifestEntry {
  webp: Record<string, string>;
  jpeg?: string;
}

import manifestData from "./image-manifest.json";

const manifest = manifestData as Record<string, ImageManifestEntry>;

export function resolveOptimizedSrc(src: string): {
  src: string;
  srcSet?: string;
  type?: string;
} {
  if (!src || src.startsWith("http")) return { src };

  let key = src;
  if (key.startsWith("/equilibrium")) key = key.slice("/equilibrium".length);
  if (!key.startsWith("/assets")) key = key.startsWith("/") ? key : `/assets${key}`;

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
