import { notFound } from "next/navigation";
import {
  getManifest,
  getRecipeIndex,
  resolveContentByPath,
} from "@/lib/content";
import { slugToPath } from "@/lib/paths";
import { buildMetadata, localBusinessJsonLd } from "@/lib/metadata";
import PageRenderer from "@/components/PageRenderer";
import ContactForms from "@/components/ContactForms";
import RecipeIndex from "@/components/RecipeIndex";
import RecipeDetail from "@/components/RecipeDetail";
import RecipeCategoryPage from "@/components/RecipeCategoryPage";
import type { RecipeData, RecipeCategoryData } from "@/lib/types";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

function slugSegmentsToPath(segments: string[]): string {
  return `/${segments.join("/")}/`;
}

export async function generateStaticParams() {
  const manifest = getManifest();
  const params: { slug: string[] }[] = [];

  for (const pageSlug of manifest.pages) {
    if (pageSlug === "home") continue;
    const pagePath = slugToPath(pageSlug);
    params.push({ slug: pagePath.replace(/^\/|\/$/g, "").split("/") });
  }

  for (const recipeSlug of manifest.recipes) {
    params.push({ slug: ["recipes", recipeSlug] });
  }

  for (const catSlug of manifest.recipeCategories) {
    params.push({ slug: ["recipe-category", catSlug] });
  }

  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug = [] } = await params;
  const pagePath = slugSegmentsToPath(slug);
  const content = resolveContentByPath(pagePath);
  if (!content) return {};

  return buildMetadata({
    title: content.title,
    description: content.metaDescription,
    path: pagePath,
    ogImage: content.ogImage,
    type: content.type === "recipe" ? "article" : "website",
  });
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug = [] } = await params;
  const pagePath = slugSegmentsToPath(slug);
  const content = resolveContentByPath(pagePath);

  if (!content) notFound();

  const showContactForms = pagePath === "/contact/";
  const showRecipeIndex = pagePath === "/nutrition/recipes/";
  const isRecipe = content.type === "recipe";
  const isCategory = content.type === "recipe-category";
  const showJsonLd = pagePath === "/contact/";

  return (
    <>
      {showJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      )}
      <div className="page-title-bar">
        <div className="container">
          <h1>{content.title}</h1>
        </div>
      </div>
      <div className="container">
        {isRecipe && <RecipeDetail recipe={content as RecipeData} />}
        {isCategory && (
          <RecipeCategoryPage
            category={content as RecipeCategoryData}
            recipes={getRecipeIndex()}
          />
        )}
        {!isRecipe && !isCategory && !showRecipeIndex && (
          <PageRenderer blocks={content.blocks} filterSidebar />
        )}
        {showRecipeIndex && (
          <>
            <p>
              Recipes – grain free, sugar free, natural and full of goodness!
            </p>
            <RecipeIndex recipes={getRecipeIndex()} />
          </>
        )}
        {showContactForms && <ContactForms />}
      </div>
    </>
  );
}
