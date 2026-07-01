import type { ContentBlock, RecipeData } from "./types";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function isDateLine(html: string): boolean {
  return /value-title|^\w+ \d{1,2}, \d{4}/.test(html);
}

export function extractDate(blocks: ContentBlock[]): string | undefined {
  for (const block of blocks) {
    if (block.type === "paragraph" && block.html) {
      const match = block.html.match(/title="(\d{4}-\d{2}-\d{2})"/);
      if (match) return match[1];
    }
  }
  return undefined;
}

export function extractDescription(blocks: ContentBlock[]): string {
  for (const block of blocks) {
    if (block.type === "paragraph" && block.html) {
      const text = stripHtml(block.html);
      if (text && !isDateLine(block.html)) return text;
    }
  }
  return "";
}

export function extractTimes(blocks: ContentBlock[]): {
  prepTime?: string;
  cookTime?: string;
  yields?: string;
} {
  const result: { prepTime?: string; cookTime?: string; yields?: string } = {};

  for (const block of blocks) {
    if (block.type !== "list" || !block.items) continue;
    for (const item of block.items) {
      const prep = item.match(/^Prep:\s*(.*)/i);
      const cook = item.match(/^Cook:\s*(.*)/i);
      const yields = item.match(/^Yields:\s*(.*)/i);
      if (prep) result.prepTime = prep[1].trim() || undefined;
      if (cook) result.cookTime = cook[1].trim() || undefined;
      if (yields) result.yields = yields[1].trim() || undefined;
    }
  }

  return result;
}

export function enrichRecipeEntry(recipe: RecipeData) {
  const times = extractTimes(recipe.blocks);
  return {
    description: recipe.description || extractDescription(recipe.blocks),
    prepTime: recipe.prepTime || times.prepTime,
    cookTime: recipe.cookTime || times.cookTime,
    yields: recipe.yields || times.yields,
    date: recipe.date || extractDate(recipe.blocks),
  };
}
