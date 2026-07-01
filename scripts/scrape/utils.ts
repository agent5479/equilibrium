import fs from "fs/promises";
import path from "path";
import { BASE_URL } from "./config";

const DELAY_MS = 500;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchHtml(url: string): Promise<string> {
  await sleep(DELAY_MS);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "EquilibriumSiteRebuild/1.0 (authorized replication)",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

export async function fetchXml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "EquilibriumSiteRebuild/1.0 (authorized replication)",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

export function urlToPath(url: string): string {
  const parsed = new URL(url);
  let pathname = parsed.pathname;
  if (!pathname.endsWith("/")) pathname += "/";
  return pathname;
}

export function pathToSlug(pagePath: string): string {
  return pagePath.replace(/^\/|\/$/g, "").replace(/\//g, "__") || "home";
}

export function slugToPath(slug: string): string {
  if (slug === "home") return "/";
  return `/${slug.replace(/__/g, "/")}/`;
}

export function resolveUrl(src: string, pageUrl: string): string {
  if (!src || src.startsWith("data:")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return `${BASE_URL}${src}`;
  return new URL(src, pageUrl).href;
}

export function localAssetPath(absoluteUrl: string): string {
  const parsed = new URL(absoluteUrl);
  if (!parsed.pathname.includes("/wp-content/")) {
    const filename = path.basename(parsed.pathname);
    return `/assets/misc/${filename}`;
  }
  const idx = parsed.pathname.indexOf("/wp-content/");
  return `/assets${parsed.pathname.slice(idx)}`;
}

export async function ensureDir(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function stripSiteUrl(href: string): string {
  if (href.startsWith(BASE_URL)) {
    return href.slice(BASE_URL.length) || "/";
  }
  return href;
}
