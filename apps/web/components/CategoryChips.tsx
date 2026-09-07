"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend";

/**
 * Category chips linking to /category/[slug]. Handles loading (skeleton chips)
 * and empty states first-class.
 */
export function CategoryChips() {
  const categories = useQuery(api.taxonomy.listCategories);

  if (categories === undefined) {
    return (
      <div className="flex flex-wrap gap-2" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-pill bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/category/${category.slug}`}
            className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm ring-1 ring-ink/5 transition hover:bg-brand-50 hover:text-brand-700"
          >
            {category.icon && <span aria-hidden>{category.icon}</span>}
            {category.nameAr}
          </Link>
        </li>
      ))}
    </ul>
  );
}
