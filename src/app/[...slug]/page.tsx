import { notFound } from "next/navigation";
import {
  getManifest,
  getRecipeIndex,
  getTestimonials,
  resolveContentByPath,
} from "@/lib/content";
import { slugToPath } from "@/lib/paths";
import { buildMetadata, localBusinessJsonLd } from "@/lib/metadata";
import PageRenderer from "@/components/PageRenderer";
import RecipeIndex from "@/components/RecipeIndex";
import RecipeDetail from "@/components/RecipeDetail";
import RecipeCategoryPage from "@/components/RecipeCategoryPage";
import TestimonialsPage from "@/components/pages/TestimonialsPage";
import GalleryPage from "@/components/pages/GalleryPage";
import StoryPage from "@/components/pages/StoryPage";
import ServicePage from "@/components/pages/ServicePage";
import CoursePage from "@/components/pages/CoursePage";
import ContactPage from "@/components/pages/ContactPage";
import PricingPage from "@/components/pages/PricingPage";
import type { PageData, RecipeData, RecipeCategoryData } from "@/lib/types";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

function slugSegmentsToPath(segments: string[]): string {
  return `/${segments.join("/")}/`;
}

const SERVICE_PATHS = new Set([
  "/about/",
  "/nutrition/",
  "/touch-for-health-kinesiology/",
  "/total-wellness-package-8-sessions-much-more/",
  "/visionboard-workshops/",
  "/yogapatricias-yoga-background/",
]);

function isServicePath(pagePath: string): boolean {
  if (SERVICE_PATHS.has(pagePath)) return true;
  if (pagePath.startsWith("/yoga/")) return true;
  if (pagePath.startsWith("/nutrition/") && pagePath !== "/nutrition/recipes/") return true;
  return false;
}

function getPageSlug(pagePath: string): string {
  return pagePath.replace(/^\/|\/$/g, "").replace(/\//g, "__") || "home";
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

function PageTitle({ title }: { title: string }) {
  return (
    <div className="page-title-bar">
      <div className="container">
        <h1>{title}</h1>
      </div>
    </div>
  );
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug = [] } = await params;
  const pagePath = slugSegmentsToPath(slug);
  const content = resolveContentByPath(pagePath);

  if (!content) notFound();

  const isRecipe = content.type === "recipe";
  const isCategory = content.type === "recipe-category";
  const isPage = content.type === "page";
  const page = content as PageData;
  const pageSlug = getPageSlug(pagePath);

  const customLayout =
    pagePath === "/testimonials/" ||
    pagePath === "/gallery/" ||
    pagePath === "/patricias-story/" ||
    pagePath === "/contact/" ||
    pagePath === "/touch-for-health-kinesiology-course/" ||
    pagePath === "/nutrition/services-and-fees/" ||
    isServicePath(pagePath);

  const showTitleBar =
    !customLayout ||
    pagePath === "/testimonials/" ||
    pagePath === "/gallery/" ||
    pagePath === "/contact/";

  const hideTitleBar =
    pagePath === "/patricias-story/" ||
    pagePath === "/touch-for-health-kinesiology-course/" ||
    isServicePath(pagePath);

  return (
    <>
      {pagePath === "/contact/" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      )}

      {showTitleBar && !hideTitleBar && <PageTitle title={content.title} />}

      {pagePath === "/testimonials/" && isPage && (
        <TestimonialsPage testimonials={getTestimonials()} />
      )}
      {pagePath === "/gallery/" && <GalleryPage />}
      {pagePath === "/patricias-story/" && isPage && <StoryPage page={page} />}
      {pagePath === "/contact/" && isPage && <ContactPage />}
      {pagePath === "/touch-for-health-kinesiology-course/" && isPage && (
        <CoursePage page={page} />
      )}
      {pagePath === "/nutrition/services-and-fees/" && isPage && (
        <>
          <PageTitle title={content.title} />
          <PricingPage />
        </>
      )}
      {isServicePath(pagePath) && isPage && (
        <ServicePage page={page} slug={pageSlug} />
      )}

      {pagePath === "/nutrition/recipes/" && (
        <>
          <PageTitle title="Recipes – great tasting and full of goodness!" />
          <div className="container content-section">
            <RecipeIndex recipes={getRecipeIndex()} />
          </div>
        </>
      )}

      {isRecipe && (
        <>
          <PageTitle title={content.title} />
          <div className="container content-section">
            <RecipeDetail recipe={content as RecipeData} />
          </div>
        </>
      )}

      {isCategory && (
        <>
          <PageTitle title={content.title} />
          <div className="container content-section">
            <RecipeCategoryPage
              category={content as RecipeCategoryData}
              recipes={getRecipeIndex()}
            />
          </div>
        </>
      )}

      {!customLayout && !isRecipe && !isCategory && pagePath !== "/nutrition/recipes/" && isPage && (
        <div className="container content-section">
          <PageRenderer blocks={page.blocks} filterSidebar />
        </div>
      )}
    </>
  );
}
