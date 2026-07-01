"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { RecipeIndexEntry } from "@/lib/types";
import OptimizedImage from "@/components/OptimizedImage";
import { routePath } from "@/lib/paths";

const PER_PAGE = 10;

const CATEGORY_LABELS: Record<string, string> = {
  "main-meals": "Main Meals",
  sides: "Sides",
  "sweets-and-cakes": "Sweets and Cakes",
  breads: "Breads",
  snacks: "Snacks",
  staples: "Pantry and fridge staples",
  "easy-to-prepare-ahead": "Easy to prepare ahead",
  "this-and-that": "This and that",
  eggs: "Eggs",
  "smoothies-and-drinks": "Smoothies and drinks",
  vegetables: "Vegetables",
};

type SortOption =
  | "title-asc"
  | "title-desc"
  | "date-desc"
  | "date-asc";

export default function RecipeIndex({ recipes }: { recipes: RecipeIndexEntry[] }) {
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortOption>("title-asc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...recipes];

    if (category) {
      result = result.filter((r) => r.categories.includes(category));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.categoryNames.some((c) => c.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      switch (sort) {
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "date-desc":
          return (b.date || "").localeCompare(a.date || "");
        case "date-asc":
          return (a.date || "").localeCompare(b.date || "");
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [recipes, category, sort, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div>
      <div className="recipe-filters">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
        >
          <option value="">All Recipe Categories</option>
          {categories.map((slug) => (
            <option key={slug} value={slug}>
              {CATEGORY_LABELS[slug]}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          aria-label="Sort recipes"
        >
          <option value="title-asc">Title (ascending)</option>
          <option value="title-desc">Title (descending)</option>
          <option value="date-desc">Date (newest first)</option>
          <option value="date-asc">Date (oldest first)</option>
        </select>

        <input
          type="search"
          placeholder="Search by keyword, ingredients, serving size or description..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="recipe-grid">
        {paged.map((recipe) => (
          <article key={recipe.slug} className="recipe-card">
            <Link href={routePath(recipe.path)} className="recipe-card-image">
              {recipe.heroImage && (
                <OptimizedImage src={recipe.heroImage} alt={recipe.title} />
              )}
            </Link>
            <div className="recipe-card-body">
              <h3>
                <Link href={routePath(recipe.path)}>{recipe.title}</Link>
              </h3>
              {recipe.description && <p>{recipe.description}</p>}
              <div className="recipe-meta">
                {recipe.prepTime && <span>Prep: {recipe.prepTime}</span>}
                {recipe.cookTime && <span> · Cook: {recipe.cookTime}</span>}
                {recipe.yields && <span> · Yields: {recipe.yields}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p>No recipes match your search.</p>
      )}

      {totalPages > 1 && (
        <div className="recipe-pagination">
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={p === currentPage ? "active" : ""}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
