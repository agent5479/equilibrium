import { fetchXml } from "./utils";
import { SITEMAP_URL, SKIP_PATHS } from "./config";

interface SitemapEntry {
  url: string;
  path: string;
  kind: "page" | "recipe" | "recipe-category";
}

function extractLocs(xml: string): string[] {
  const locs: string[] = [];
  const regex = /<loc>([^<]+)<\/loc>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    locs.push(match[1].trim());
  }
  return locs;
}

function classifyUrl(urlPath: string): SitemapEntry["kind"] | null {
  if (SKIP_PATHS.has(urlPath)) return null;
  if (urlPath.startsWith("/recipes/")) return "recipe";
  if (urlPath.startsWith("/recipe-category/")) return "recipe-category";
  if (urlPath === "/") return "page";
  return "page";
}

export async function crawlSitemap(): Promise<SitemapEntry[]> {
  const rootXml = await fetchXml(SITEMAP_URL);
  const subSitemaps = extractLocs(rootXml).filter((u) => u.endsWith(".xml"));

  const allUrls = new Set<string>();
  for (const sub of subSitemaps) {
    const xml = await fetchXml(sub);
    for (const loc of extractLocs(xml)) {
      allUrls.add(loc);
    }
  }

  const entries: SitemapEntry[] = [];
  for (const url of allUrls) {
    const parsed = new URL(url);
    const pagePath = parsed.pathname.endsWith("/")
      ? parsed.pathname
      : `${parsed.pathname}/`;
    const kind = classifyUrl(pagePath);
    if (!kind) continue;
    entries.push({ url, path: pagePath, kind });
  }

  entries.sort((a, b) => a.path.localeCompare(b.path));
  return entries;
}
