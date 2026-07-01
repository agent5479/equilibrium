import fs from "fs/promises";
import path from "path";
import { BASE_URL } from "./config";
import { ensureDir, localAssetPath, resolveUrl } from "./utils";

const downloaded = new Set<string>();

export async function downloadAsset(
  absoluteUrl: string,
  publicDir: string
): Promise<string> {
  if (!absoluteUrl || absoluteUrl.startsWith("data:")) return absoluteUrl;
  if (downloaded.has(absoluteUrl)) return localAssetPath(absoluteUrl);

  const localPath = localAssetPath(absoluteUrl);
  const diskPath = path.join(publicDir, localPath.replace(/^\//, ""));

  try {
    await fs.access(diskPath);
    downloaded.add(absoluteUrl);
    return localPath;
  } catch {
    // continue to download
  }

  try {
    const response = await fetch(absoluteUrl, {
      headers: { "User-Agent": "EquilibriumSiteRebuild/1.0" },
    });
    if (!response.ok) return absoluteUrl;
    const buffer = Buffer.from(await response.arrayBuffer());
    await ensureDir(diskPath);
    await fs.writeFile(diskPath, buffer);
    downloaded.add(absoluteUrl);
    return localPath;
  } catch {
    return absoluteUrl;
  }
}

export async function downloadCss(
  publicDir: string,
  stylesDir: string
): Promise<void> {
  const cssUrls = [
    `${BASE_URL}/wp-content/themes/enfold/css/grid.css`,
    `${BASE_URL}/wp-content/themes/enfold/css/base.css`,
    `${BASE_URL}/wp-content/themes/enfold/css/layout.css`,
    `${BASE_URL}/wp-content/themes/enfold/css/shortcodes.css`,
    `${BASE_URL}/wp-content/themes/enfold/css/avia-snippet-widget.css`,
    `${BASE_URL}/wp-content/themes/enfold-child/style.css`,
    `${BASE_URL}/wp-content/uploads/dynamic_avia/enfold_child.css`,
    `${BASE_URL}/wp-content/plugins/cooked/assets/css/front-end.css`,
    `${BASE_URL}/wp-content/plugins/cooked/assets/css/color-theme.css`,
    `${BASE_URL}/wp-content/plugins/cooked/assets/css/front-end-responsive.css`,
  ];

  const combined: string[] = [
    `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');`,
    "",
  ];

  for (const url of cssUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        let css = await response.text();
        css = css.replace(/url\((['"]?)(\/wp-content\/[^'")]+)\1\)/g, (_, quote, p) => {
          return `url(${quote}/equilibrium/assets${p}${quote})`;
        });
        combined.push(`/* ${url} */`);
        combined.push(css);
        combined.push("");
      }
    } catch {
      // skip failed css
    }
  }

  await ensureDir(path.join(stylesDir, "enfold-theme.css"));
  await fs.writeFile(path.join(stylesDir, "enfold-theme.css"), combined.join("\n"));
}

export async function downloadBrandAssets(publicDir: string): Promise<void> {
  const assets = [
    `${BASE_URL}/wp-content/uploads/2023/02/logo.png`,
    `${BASE_URL}/wp-content/uploads/2023/02/logo-300x240.png`,
    `${BASE_URL}/wp-content/uploads/2023/02/favicon.png`,
  ];
  for (const url of assets) {
    await downloadAsset(url, publicDir);
  }
  const faviconSrc = path.join(
    publicDir,
    "assets/wp-content/uploads/2023/02/favicon.png"
  );
  const faviconDest = path.join(publicDir, "favicon.png");
  try {
    await fs.copyFile(faviconSrc, faviconDest);
  } catch {
    // ignore
  }
}

export function rewriteHtmlAssets(
  html: string,
  pageUrl: string,
  assetMap: Map<string, string>
): string {
  return html.replace(
    /(src|href)=(['"])([^'"]+)\2/g,
    (match, attr, quote, value) => {
      if (
        value.startsWith("#") ||
        value.startsWith("mailto:") ||
        value.startsWith("tel:") ||
        value.startsWith("javascript:")
      ) {
        return match;
      }
      const absolute = resolveUrl(value, pageUrl);
      if (absolute.includes("/wp-content/") && assetMap.has(absolute)) {
        return `${attr}=${quote}/equilibrium${assetMap.get(absolute)}${quote}`;
      }
      if (value.startsWith(BASE_URL)) {
        const internal = value.slice(BASE_URL.length) || "/";
        return `${attr}=${quote}/equilibrium${internal.endsWith("/") ? internal : internal + "/"}${quote}`;
      }
      return match;
    }
  );
}

export async function processImagesInHtml(
  html: string,
  pageUrl: string,
  publicDir: string
): Promise<{ html: string; firstImage?: string }> {
  const assetMap = new Map<string, string>();
  let firstImage: string | undefined;
  const imgRegex = /<img[^>]+src=(['"])([^'"]+)\1[^>]*>/gi;
  let match: RegExpExecArray | null;
  const urls: string[] = [];
  while ((match = imgRegex.exec(html)) !== null) {
    urls.push(resolveUrl(match[2], pageUrl));
  }

  for (const url of urls) {
    if (url.includes("/wp-content/")) {
      const local = await downloadAsset(url, publicDir);
      assetMap.set(url, local);
      if (!firstImage) firstImage = local;
    }
  }

  return { html: rewriteHtmlAssets(html, pageUrl, assetMap), firstImage };
}
