import fs from "fs/promises";
import path from "path";
import { crawlSitemap } from "./sitemap";
import { fetchHtml, pathToSlug, writeJson } from "./utils";
import { parsePageHtml } from "./parse-page";
import { parseRecipeHtml, parseRecipeCategoryHtml } from "./parse-recipe";
import {
  downloadAsset,
  downloadBrandAssets,
  downloadCss,
  processImagesInHtml,
} from "./assets";
import type { RecipeIndexEntry, SiteManifest } from "./types";

const ROOT = path.resolve(process.cwd());
const CONTENT_DIR = path.join(ROOT, "content");
const PUBLIC_DIR = path.join(ROOT, "public");
const STYLES_DIR = path.join(ROOT, "src", "styles");

async function scrapeEntry(
  entry: { url: string; path: string; kind: string },
  publicDir: string
) {
  const html = await fetchHtml(entry.url);
  const slug = pathToSlug(entry.path === "/" ? "/" : entry.path);

  if (entry.kind === "recipe") {
    const recipeSlug = entry.path.replace(/^\/recipes\/|\/$/g, "");
    const recipe = parseRecipeHtml(html, entry.url, recipeSlug);

    if (recipe.heroImage) {
      const local = await downloadAsset(recipe.heroImage, publicDir);
      recipe.heroImage = local;
      recipe.ogImage = local;
    }

    for (const block of recipe.blocks) {
      if (block.type === "image" && block.src) {
        block.src = await downloadAsset(block.src, publicDir);
      }
      if (block.type === "paragraph" || block.type === "html") {
        const processed = await processImagesInHtml(block.html, entry.url, publicDir);
        block.html = processed.html;
      }
    }

    if (recipe.ingredients) {
      const processed = await processImagesInHtml(recipe.ingredients, entry.url, publicDir);
      recipe.ingredients = processed.html;
    }
    if (recipe.directions) {
      const processed = await processImagesInHtml(recipe.directions, entry.url, publicDir);
      recipe.directions = processed.html;
    }

    await writeJson(path.join(CONTENT_DIR, "recipes", `${recipeSlug}.json`), recipe);
    return { kind: "recipe" as const, slug: recipeSlug, data: recipe };
  }

  if (entry.kind === "recipe-category") {
    const categorySlug = entry.path.replace(/^\/recipe-category\/|\/$/g, "");
    const parsed = parseRecipeCategoryHtml(html, categorySlug);
    const content = {
      slug: `recipe-category__${categorySlug}`,
      path: entry.path,
      title: parsed.title,
      metaDescription: parsed.metaDescription,
      type: "recipe-category" as const,
      categorySlug,
      recipeSlugs: parsed.recipeSlugs,
      blocks: parsed.blocks,
    };
    await writeJson(
      path.join(CONTENT_DIR, "recipe-categories", `${categorySlug}.json`),
      content
    );
    return { kind: "recipe-category" as const, slug: categorySlug };
  }

  const parsed = parsePageHtml(html, entry.url);
  const content: Record<string, unknown> = {
    slug,
    path: entry.path,
    title: parsed.title,
    metaDescription: parsed.metaDescription,
    type: "page",
    ogImage: parsed.ogImage,
    blocks: parsed.blocks,
  };

  for (const block of parsed.blocks) {
    if (block.type === "image" && block.src) {
      block.src = await downloadAsset(block.src, publicDir);
    }
    if (block.type === "paragraph" || block.type === "html") {
      const processed = await processImagesInHtml(block.html, entry.url, publicDir);
      block.html = processed.html;
      if (processed.firstImage && !content.ogImage) {
        content.ogImage = processed.firstImage;
      }
    }
    if (block.type === "columns") {
      for (const col of block.columns) {
        for (const b of col) {
          if (b.type === "image" && b.src) {
            b.src = await downloadAsset(b.src, publicDir);
          }
          if (b.type === "paragraph" || b.type === "html") {
            const processed = await processImagesInHtml(b.html, entry.url, publicDir);
            b.html = processed.html;
          }
        }
      }
    }
  }

  if (parsed.ogImage) {
    content.ogImage = await downloadAsset(parsed.ogImage, publicDir);
  }

  await writeJson(path.join(CONTENT_DIR, "pages", `${slug}.json`), content);
  return { kind: "page" as const, slug };
}

async function main() {
  console.log("Starting Equilibrium site scrape...");
  await fs.mkdir(path.join(CONTENT_DIR, "pages"), { recursive: true });
  await fs.mkdir(path.join(CONTENT_DIR, "recipes"), { recursive: true });
  await fs.mkdir(path.join(CONTENT_DIR, "recipe-categories"), { recursive: true });

  console.log("Downloading theme CSS and brand assets...");
  await downloadCss(PUBLIC_DIR, STYLES_DIR);
  await downloadBrandAssets(PUBLIC_DIR);

  console.log("Crawling sitemap...");
  const entries = await crawlSitemap();
  console.log(`Found ${entries.length} URLs to scrape`);

  const manifest: SiteManifest = {
    pages: [],
    recipes: [],
    recipeCategories: [],
    scrapedAt: new Date().toISOString(),
  };

  const recipeIndex: RecipeIndexEntry[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    console.log(`[${i + 1}/${entries.length}] ${entry.path}`);
    try {
      const result = await scrapeEntry(entry, PUBLIC_DIR);
      if (result.kind === "page") manifest.pages.push(result.slug);
      if (result.kind === "recipe") {
        manifest.recipes.push(result.slug);
        const r = result.data;
        recipeIndex.push({
          slug: r.slug,
          path: r.path,
          title: r.title,
          description: r.description,
          heroImage: r.heroImage,
          categories: r.categories,
          categoryNames: r.categoryNames,
          prepTime: r.prepTime,
          cookTime: r.cookTime,
          yields: r.yields,
          date: r.date,
        });
      }
      if (result.kind === "recipe-category") manifest.recipeCategories.push(result.slug);
    } catch (err) {
      console.error(`  FAILED: ${entry.path}`, err);
    }
  }

  recipeIndex.sort((a, b) => a.title.localeCompare(b.title));
  await writeJson(path.join(CONTENT_DIR, "recipes", "index.json"), recipeIndex);
  await writeJson(path.join(CONTENT_DIR, "manifest.json"), manifest);

  console.log(`Done. Pages: ${manifest.pages.length}, Recipes: ${manifest.recipes.length}, Categories: ${manifest.recipeCategories.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
