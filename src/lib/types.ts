export interface ContentBlock {
  type: string;
  level?: number;
  text?: string;
  html?: string;
  src?: string;
  alt?: string;
  caption?: string;
  columns?: ContentBlock[][];
  ordered?: boolean;
  items?: string[];
  href?: string;
}

export interface PageData {
  slug: string;
  path: string;
  title: string;
  metaDescription: string;
  type: "page" | "recipe" | "recipe-category";
  ogImage?: string;
  blocks: ContentBlock[];
}

export interface RecipeData extends PageData {
  type: "recipe";
  description: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  yields?: string;
  categories: string[];
  categoryNames: string[];
  ingredients: string;
  directions: string;
  heroImage: string;
  date?: string;
}

export interface RecipeCategoryData extends PageData {
  type: "recipe-category";
  categorySlug: string;
  recipeSlugs: string[];
}

export interface RecipeIndexEntry {
  slug: string;
  path: string;
  title: string;
  description: string;
  heroImage: string;
  categories: string[];
  categoryNames: string[];
  prepTime?: string;
  cookTime?: string;
  yields?: string;
  date?: string;
}

export interface TestimonialEntry {
  quote: string;
  name: string;
  category: string;
}

export interface SiteManifest {
  pages: string[];
  recipes: string[];
  recipeCategories: string[];
  scrapedAt: string;
}

export const SITE_URL = "https://equilibriumhealth.nz";
export const SITE_NAME = "Equilibrium Kinesiology & Nutrition";
export const DEFAULT_OG_IMAGE = "/assets/wp-content/uploads/2023/02/logo.png";
export const DEFAULT_DESCRIPTION =
  "Kinesiology, Nutrition, and Yoga with Patricia Smith in New Zealand. Bring your whole being back into balance — live like you love yourself.";

