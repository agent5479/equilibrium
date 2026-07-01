import Link from "next/link";
import type { RecipeCategoryData, RecipeIndexEntry } from "@/lib/types";
import { routePath } from "@/lib/paths";
import PageRenderer from "./PageRenderer";

export default function RecipeCategoryPage({
  category,
  recipes,
}: {
  category: RecipeCategoryData;
  recipes: RecipeIndexEntry[];
}) {
  const categoryRecipes = recipes.filter((r) =>
    category.recipeSlugs.includes(r.slug)
  );

  return (
    <div>
      <PageRenderer blocks={category.blocks} filterSidebar />

      <h2>Recipes in this category</h2>
      <ul className="category-recipe-list">
        {categoryRecipes.map((recipe) => (
          <li key={recipe.slug}>
            <Link href={routePath(recipe.path)}>{recipe.title}</Link>
          </li>
        ))}
      </ul>

      {categoryRecipes.length === 0 && category.recipeSlugs.length > 0 && (
        <ul className="category-recipe-list">
          {category.recipeSlugs.map((slug) => (
            <li key={slug}>
              <Link href={routePath(`/recipes/${slug}/`)}>
                {slug.replace(/-/g, " ")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
