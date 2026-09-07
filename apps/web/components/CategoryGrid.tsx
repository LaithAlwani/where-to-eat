"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@repo/backend";
import { PaginatedGrid, type PaginationStatus } from "./PaginatedGrid";

/** Paginated grid of restaurants in a category, with an Arabic heading. */
export function CategoryGrid({ slug }: { slug: string }) {
  const categories = useQuery(api.taxonomy.listCategories);
  const { results, status, loadMore } = usePaginatedQuery(
    api.restaurants.listByCategory,
    { categorySlug: slug },
    { initialNumItems: 12 },
  );

  const category = categories?.find((c) => c.slug === slug);

  return (
    <>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
        {category?.icon && <span aria-hidden>{category.icon}</span>}
        {category?.nameAr ?? "التصنيف"}
      </h1>
      <PaginatedGrid
        results={results}
        status={status as PaginationStatus}
        loadMore={loadMore}
        emptyMessage="لا توجد أماكن في هذا التصنيف بعد"
      />
    </>
  );
}
