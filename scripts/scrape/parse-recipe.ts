import * as cheerio from "cheerio";
import type { RecipeContent } from "./types";
import { BASE_URL } from "./config";
import { stripSiteUrl } from "./utils";
import { parsePageHtml } from "./parse-page";

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function parseRecipeHtml(html: string, pageUrl: string, slug: string): RecipeContent {
  const $ = cheerio.load(html);
  const base = parsePageHtml(html, pageUrl);

  const title =
    cleanText($(".cooked-recipe-info h2, .entry-title, h1").first().text()) ||
    base.title;

  const description =
    cleanText($(".cooked-recipe-excerpt, .cooked-description").first().text()) ||
    base.metaDescription;

  const heroImage =
    $('meta[property="og:image"]').attr("content") ||
    $(".cooked-recipe-image img, .wp-post-image").first().attr("src") ||
    "";

  const metaText = cleanText($(".cooked-recipe-info, .cooked-meta").text());

  const prepMatch = metaText.match(/Prep[:\s]+([^\n]+?)(?=Cook|Total|Yields|$)/i);
  const cookMatch = metaText.match(/Cook[:\s]+([^\n]+?)(?=Total|Yields|$)/i);
  const totalMatch = metaText.match(/Total[:\s]+([^\n]+?)(?=Yields|$)/i);
  const yieldsMatch = metaText.match(/Yields?[:\s]+([^\n]+)/i);

  const categories: string[] = [];
  const categoryNames: string[] = [];
  $(".cooked-recipe-category a, .cooked-taxonomy a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const name = cleanText($(el).text());
    const slugMatch = href.match(/recipe-category\/([^/]+)/);
    if (slugMatch) {
      categories.push(slugMatch[1]);
      categoryNames.push(name);
    }
  });

  let ingredients = "";
  let directions = "";

  const ingredientsEl = $(
    "#cooked-recipe-ingredients, .cooked-recipe-ingredients, .cooked-ingredients"
  ).first();
  if (ingredientsEl.length) {
    ingredients = ingredientsEl.html()?.trim() || cleanText(ingredientsEl.text());
  }

  const directionsEl = $(
    "#cooked-recipe-directions, .cooked-recipe-directions, .cooked-directions"
  ).first();
  if (directionsEl.length) {
    directions = directionsEl.html()?.trim() || cleanText(directionsEl.text());
  }

  if (!ingredients || !directions) {
    $(".cooked-tabs-content, .cooked-single").find("section, .tab-content").each((_, tab) => {
      const heading = cleanText($(tab).find("h3,h4").first().text()).toLowerCase();
      const content = $(tab).html()?.trim() || "";
      if (heading.includes("ingredient") && !ingredients) ingredients = content;
      if (heading.includes("direction") && !directions) directions = content;
    });
  }

  const date =
    $("time").attr("datetime") ||
    $('meta[property="article:published_time"]').attr("content");

  const path = `/recipes/${slug}/`;

  return {
    slug,
    path,
    title,
    metaDescription: description || base.metaDescription,
    type: "recipe",
    ogImage: heroImage,
    blocks: base.blocks,
    description,
    prepTime: prepMatch?.[1]?.trim(),
    cookTime: cookMatch?.[1]?.trim(),
    totalTime: totalMatch?.[1]?.trim(),
    yields: yieldsMatch?.[1]?.trim(),
    categories,
    categoryNames,
    ingredients,
    directions,
    heroImage,
    date,
  };
}

export function parseRecipeCategoryHtml(
  html: string,
  categorySlug: string
): { title: string; metaDescription: string; recipeSlugs: string[]; blocks: RecipeContent["blocks"] } {
  const $ = cheerio.load(html);
  const base = parsePageHtml(html, `${BASE_URL}/recipe-category/${categorySlug}/`);

  const recipeSlugs: string[] = [];
  $("a[href*='/recipes/']").each((_, el) => {
    const href = $(el).attr("href") || "";
    const match = href.match(/\/recipes\/([^/]+)/);
    if (match && !recipeSlugs.includes(match[1])) {
      recipeSlugs.push(match[1]);
    }
  });

  return {
    title: base.title,
    metaDescription: base.metaDescription,
    recipeSlugs,
    blocks: base.blocks,
  };
}
