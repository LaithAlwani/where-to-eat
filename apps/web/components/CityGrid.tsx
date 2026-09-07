"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@repo/backend";
import { PaginatedGrid, type PaginationStatus } from "./PaginatedGrid";

/** Paginated grid of restaurants in a city (area browsing), Arabic heading. */
export function CityGrid({ slug }: { slug: string }) {
  const cities = useQuery(api.taxonomy.listCities);
  const { results, status, loadMore } = usePaginatedQuery(
    api.restaurants.listByCity,
    { citySlug: slug },
    { initialNumItems: 12 },
  );

  const city = cities?.find((c) => c.slug === slug);

  return (
    <>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
        <span aria-hidden>📍</span>
        {city?.nameAr ?? "المدينة"}
      </h1>
      <PaginatedGrid
        results={results}
        status={status as PaginationStatus}
        loadMore={loadMore}
        emptyMessage="لا توجد أماكن في هذه المدينة بعد"
      />
    </>
  );
}
