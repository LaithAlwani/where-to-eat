"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend";

/** Category slug → Material Symbol glyph (fallback `restaurant`). */
const CATEGORY_ICON: Record<string, string> = {
  restaurants: "restaurant",
  cafes: "local_cafe",
  sweets: "cake",
  bakeries: "bakery_dining",
  "fast-food": "lunch_dining",
  grill: "outdoor_grill",
  shawarma: "lunch_dining",
  seafood: "set_meal",
  breakfast: "egg_alt",
  pizza: "local_pizza",
  burger: "lunch_dining",
};

/**
 * "شو نفسك؟" category picker: a compact 2/4-col grid of icon cards linking to
 * each category page. Skeletons while loading; renders nothing when empty.
 */
export function CategoryGridHome() {
  const categories = useQuery(api.taxonomy.listCategories);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl font-black text-ink">شو نفسك؟</h2>
      {categories === undefined ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-h-28 animate-pulse rounded-card bg-surface-muted"
            />
          ))}
        </div>
      ) : categories.length === 0 ? null : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-card border border-line bg-surface p-3 text-center transition hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span className="ms text-4xl text-accent-ink" aria-hidden>
                  {CATEGORY_ICON[category.slug] ?? "restaurant"}
                </span>
                <span className="font-heading text-xl font-black leading-tight text-ink">
                  {category.nameAr}
                </span>
                <span dir="ltr" className="text-xs text-ink-muted">
                  {category.nameEn}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
