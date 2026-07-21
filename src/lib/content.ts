import fs from "fs";
import path from "path";
import type {
  PageData,
  RecipeCategoryData,
  RecipeData,
  RecipeIndexEntry,
  SiteManifest,
  TestimonialEntry,
} from "./types";
import { pathToSlug, slugToPath } from "./paths";
import { enrichRecipeEntry } from "./recipe-meta";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function readJson<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getManifest(): SiteManifest {
  return (
    readJson<SiteManifest>(path.join(CONTENT_ROOT, "manifest.json")) || {
      pages: [],
      recipes: [],
      recipeCategories: [],
      scrapedAt: "",
    }
  );
}

export function getPageBySlug(slug: string): PageData | null {
  return readJson<PageData>(path.join(CONTENT_ROOT, "pages", `${slug}.json`));
}

export function getPageByPath(pagePath: string): PageData | null {
  return getPageBySlug(pathToSlug(pagePath));
}

export function getRecipe(slug: string): RecipeData | null {
  return readJson<RecipeData>(path.join(CONTENT_ROOT, "recipes", `${slug}.json`));
}

export function getRecipeCategory(slug: string): RecipeCategoryData | null {
  return readJson<RecipeCategoryData>(
    path.join(CONTENT_ROOT, "recipe-categories", `${slug}.json`)
  );
}

export function getTestimonials(): TestimonialEntry[] {
  return readJson<TestimonialEntry[]>(path.join(CONTENT_ROOT, "testimonials.json")) || [];
}

export function getRecipeIndex(): RecipeIndexEntry[] {
  const index =
    readJson<RecipeIndexEntry[]>(path.join(CONTENT_ROOT, "recipes", "index.json")) || [];

  return index.map((entry) => {
    const recipe = getRecipe(entry.slug);
    if (!recipe) return entry;
    const meta = enrichRecipeEntry(recipe);
    return { ...entry, ...meta };
  });
}

export function getAllStaticPaths(): string[] {
  const manifest = getManifest();
  const paths = ["/"];
  for (const slug of manifest.pages) {
    if (slug !== "home") paths.push(slugToPath(slug));
  }
  for (const slug of manifest.recipes) {
    paths.push(`/recipes/${slug}/`);
  }
  for (const slug of manifest.recipeCategories) {
    paths.push(`/recipe-category/${slug}/`);
  }
  paths.push("/bookings/");
  paths.push("/local/");
  return paths;
}

export function resolveContentByPath(
  pagePath: string
): PageData | RecipeData | RecipeCategoryData | null {
  if (pagePath.startsWith("/recipes/")) {
    const slug = pagePath.replace(/^\/recipes\/|\/$/g, "");
    return getRecipe(slug);
  }
  if (pagePath.startsWith("/recipe-category/")) {
    const slug = pagePath.replace(/^\/recipe-category\/|\/$/g, "");
    return getRecipeCategory(slug);
  }
  return getPageByPath(pagePath);
}
