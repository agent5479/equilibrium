import fs from "fs";
import path from "path";
import { getAllStaticPaths } from "../src/lib/content";
import { SITE_URL } from "../src/lib/types";

const OUT_DIR = path.join(process.cwd(), "out");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function priorityFor(pagePath: string): string {
  if (pagePath === "/") return "1.0";
  if (
    pagePath === "/bookings/" ||
    pagePath === "/contact/" ||
    pagePath === "/testimonials/" ||
    pagePath === "/patricias-story/" ||
    pagePath === "/touch-for-health-kinesiology/" ||
    pagePath === "/nutrition/" ||
    pagePath === "/about/"
  ) {
    return "0.9";
  }
  return "0.8";
}

function changeFreqFor(pagePath: string): string {
  if (pagePath === "/" || pagePath === "/bookings/") return "weekly";
  return "monthly";
}

function generateSitemap() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const paths = getAllStaticPaths();
  const urls = paths.map((p) => {
    const loc = p === "/" ? `${SITE_URL}/` : `${SITE_URL}${p}`;
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changeFreqFor(p)}</changefreq>`,
      `    <priority>${priorityFor(p)}</priority>`,
      "  </url>",
    ].join("\n");
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), xml, "utf-8");

  // Also keep a public copy for local preview / consistency
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), xml, "utf-8");

  // Ensure robots.txt is present in out (copied from public, but reaffirm sitemap URL)
  const robots = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(OUT_DIR, "robots.txt"), robots, "utf-8");

  console.log(`Generated sitemap.xml with ${paths.length} URLs`);
}

generateSitemap();
