import fs from "fs";
import path from "path";
import sharp from "sharp";

const ASSETS_DIR = path.join(process.cwd(), "public", "assets");
const WIDTHS = [1920, 1200, 800, 400];
const MANIFEST_PATH = path.join(ASSETS_DIR, "manifest.json");
const SRC_MANIFEST_PATH = path.join(process.cwd(), "src", "lib", "image-manifest.json");

interface ImageManifest {
  [originalKey: string]: {
    webp: Record<string, string>;
    jpeg?: string;
  };
}

function walkDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (isSourceImage(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function isSourceImage(name: string): boolean {
  if (!/\.(jpe?g|png)$/i.test(name)) return false;
  if (/-opt\.jpe?g$/i.test(name)) return false;
  if (/-\d+\.webp$/i.test(name)) return false;
  if (/^logo(-\d+x\d+)?\.png$/i.test(name)) return false;
  if (/^favicon\.png$/i.test(name)) return false;
  return true;
}

async function optimizeImage(filePath: string, manifest: ImageManifest) {
  const rel = path.relative(path.join(process.cwd(), "public"), filePath).replace(/\\/g, "/");
  const key = "/" + rel.replace(/^assets\//, "assets/");
  const ext = path.extname(filePath).toLowerCase();
  const baseName = filePath.slice(0, -ext.length);
  const meta = await sharp(filePath).metadata();
  const originalWidth = meta.width || 1920;

  manifest[key] = { webp: {} };

  for (const w of WIDTHS) {
    if (w > originalWidth) continue;
    const outPath = `${baseName}-${w}.webp`;
    await sharp(filePath)
      .resize(w, undefined, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);
    manifest[key].webp[String(w)] = "/" + path.relative(path.join(process.cwd(), "public"), outPath).replace(/\\/g, "/");
  }

  const jpegOut = `${baseName}-opt.jpg`;
  const targetW = Math.min(originalWidth, 1200);
  await sharp(filePath)
    .resize(targetW, undefined, { withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(jpegOut);
  manifest[key].jpeg = "/" + path.relative(path.join(process.cwd(), "public"), jpegOut).replace(/\\/g, "/");

  const before = fs.statSync(filePath).size;
  const after = fs.statSync(jpegOut).size;
  console.log(`  ${key}: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`);
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.log("No public/assets directory — run npm run scrape first.");
    fs.writeFileSync(MANIFEST_PATH, "{}");
    fs.writeFileSync(SRC_MANIFEST_PATH, "{}");
    return;
  }

  const files = walkDir(ASSETS_DIR);
  console.log(`Optimizing ${files.length} images...`);
  const manifest: ImageManifest = {};

  for (const file of files) {
    try {
      await optimizeImage(file, manifest);
    } catch (err) {
      console.warn(`  Skip ${file}:`, err);
    }
  }

  const json = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(MANIFEST_PATH, json);
  fs.writeFileSync(SRC_MANIFEST_PATH, json);
  console.log(`Done. Manifest written to ${MANIFEST_PATH}`);
}

main().catch(console.error);
