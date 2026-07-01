import Link from "next/link";
import type { RecipeData } from "@/lib/types";
import { assetUrl, publicPath, routePath } from "@/lib/paths";
import PageRenderer from "./PageRenderer";

function extractRecipeSections(blocks: RecipeData["blocks"]) {
  let inIngredients = false;
  let inDirections = false;
  const contentBlocks: RecipeData["blocks"] = [];
  const ingredientBlocks: RecipeData["blocks"] = [];
  const directionBlocks: RecipeData["blocks"] = [];

  for (const block of blocks) {
    if (block.type === "heading" && block.text) {
      const t = block.text.toLowerCase();
      if (t === "ingredients") {
        inIngredients = true;
        inDirections = false;
        continue;
      }
      if (t === "directions" || t === "instructions") {
        inDirections = true;
        inIngredients = false;
        continue;
      }
      if (t.includes("archives") || t.includes("browse")) {
        inIngredients = false;
        inDirections = false;
        continue;
      }
    }

    if (inIngredients) {
      ingredientBlocks.push(block);
    } else if (inDirections) {
      directionBlocks.push(block);
    } else if (
      block.type !== "heading" ||
      (block.text && !block.text.toLowerCase().includes("archives"))
    ) {
      if (!isSidebarBlock(block)) {
        contentBlocks.push(block);
      }
    }
  }

  return { contentBlocks, ingredientBlocks, directionBlocks };
}

function isSidebarBlock(block: RecipeData["blocks"][0]): boolean {
  if (block.type === "list" && block.items) {
    const navItems = ["Welcome", "Gallery", "Testimonials", "Contact"];
    return block.items.some((item) => navItems.some((n) => item.includes(n)));
  }
  return false;
}

export default function RecipeDetail({ recipe }: { recipe: RecipeData }) {
  const { contentBlocks, ingredientBlocks, directionBlocks } = extractRecipeSections(
    recipe.blocks
  );

  const ingredients = recipe.ingredients || renderBlocksHtml(ingredientBlocks);
  const directions = recipe.directions || renderBlocksHtml(directionBlocks);

  return (
    <article>
      {recipe.heroImage && (
        <div className="recipe-hero">
          <img src={assetUrl(recipe.heroImage)} alt={recipe.title} />
        </div>
      )}

      <h1>{recipe.title}</h1>

      {recipe.description && <p className="recipe-description">{recipe.description}</p>}

      <div className="recipe-info-bar">
        {recipe.prepTime && <span><strong>Prep:</strong> {recipe.prepTime}</span>}
        {recipe.cookTime && <span><strong>Cook:</strong> {recipe.cookTime}</span>}
        {recipe.totalTime && <span><strong>Total:</strong> {recipe.totalTime}</span>}
        {recipe.yields && <span><strong>Yields:</strong> {recipe.yields}</span>}
        {recipe.categoryNames.length > 0 && (
          <span className="recipe-categories">
            {recipe.categories.map((slug, i) => (
              <Link key={slug} href={routePath(`/recipe-category/${slug}/`)}>
                {recipe.categoryNames[i]}
                {i < recipe.categories.length - 1 ? ", " : ""}
              </Link>
            ))}
          </span>
        )}
      </div>

      <PageRenderer blocks={contentBlocks} filterSidebar />

      {(ingredients || directions) && (
        <div className="recipe-tabs">
          {ingredients && (
            <div className="recipe-tab-content">
              <h2>Ingredients</h2>
              <div dangerouslySetInnerHTML={{ __html: rewriteAssets(ingredients) }} />
            </div>
          )}
          {directions && (
            <div className="recipe-tab-content">
              <h2>Directions</h2>
              <div dangerouslySetInnerHTML={{ __html: rewriteAssets(directions) }} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function renderBlocksHtml(blocks: RecipeData["blocks"]): string {
  return blocks
    .map((b) => {
      if (b.type === "paragraph" || b.type === "html") return b.html || "";
      if (b.type === "list" && b.items) {
        const tag = b.ordered ? "ol" : "ul";
        return `<${tag}>${b.items.map((i) => `<li>${i}</li>`).join("")}</${tag}>`;
      }
      return "";
    })
    .join("");
}

function rewriteAssets(html: string): string {
  return html
    .replace(/src="\/assets\//g, 'src="/equilibrium/assets/')
    .replace(/href="\/(?!equilibrium)([^"]*)"/g, (_, p) => `href="${publicPath(`/${p}`)}"`);
}
