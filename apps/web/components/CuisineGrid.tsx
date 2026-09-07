"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@repo/backend";
import { PaginatedGrid, type PaginationStatus } from "./PaginatedGrid";

/** Paginated grid of restaurants for a cuisine, with an Arabic heading. */
export function CuisineGrid({ slug }: { slug: string }) {
  const cuisines = useQuery(api.taxonomy.listCuisines);
  const { results, status, loadMore } = usePaginatedQuery(
    api.restaurants.listByCuisine,
    { cuisineSlug: slug },
    { initialNumItems: 12 },
  );

  const cuisine = cuisines?.find((c) => c.slug === slug);

  return (
    <>
      <h1 className="text-2xl font-bold text-ink">
        {cuisine?.nameAr ?? "المطبخ"}
      </h1>
      <PaginatedGrid
        results={results}
        status={status as PaginationStatus}
        loadMore={loadMore}
        emptyMessage="لا توجد أماكن لهذا النوع بعد"
      />
    </>
  );
}
