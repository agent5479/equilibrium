import fs from "fs";
import path from "path";
import { getAllStaticPaths } from "../src/lib/content";
import { SITE_URL } from "../src/lib/types";

const OUT_DIR = path.join(process.cwd(), "out");

function generateSitemap() {
  const paths = getAllStaticPaths();
  const urls = paths.map((p) => {
    const loc = p === "/" ? `${SITE_URL}/` : `${SITE_URL}${p}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${p === "/" ? "1.0" : "0.8"}</priority>\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), xml, "utf-8");
  console.log(`Generated sitemap.xml with ${paths.length} URLs`);
}

generateSitemap();
