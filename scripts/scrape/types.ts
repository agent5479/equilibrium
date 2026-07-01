export type ContentBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; html: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "columns"; columns: ContentBlock[][] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "button"; text: string; href: string }
  | { type: "html"; html: string };

export interface PageContent {
  slug: string;
  path: string;
  title: string;
  metaDescription: string;
  type: "page" | "recipe" | "recipe-category";
  ogImage?: string;
  blocks: ContentBlock[];
}

export interface RecipeContent extends PageContent {
  type: "recipe";
  description: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  yields?: string;
  difficulty?: string;
  categories: string[];
  categoryNames: string[];
  ingredients: string;
  directions: string;
  heroImage: string;
  date?: string;
}

export interface RecipeCategoryContent extends PageContent {
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

export interface SiteManifest {
  pages: string[];
  recipes: string[];
  recipeCategories: string[];
  scrapedAt: string;
}
