"use client";

import { useRouter } from "next/navigation";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { SearchBar } from "./SearchBar";
import { PaginatedGrid, type PaginationStatus } from "./PaginatedGrid";

type PriceTierValue = 1 | 2 | 3 | 4;

type SearchResultsProps = {
  q: string;
  cityId?: string;
  priceTier?: PriceTierValue;
};

/**
 * Search experience: a query bar, a filter row (city + price tier) that rewrites
 * the URL query params, and a paginated results grid. The backend search
 * requires a non-empty query, so with no `q` we prompt rather than fetch.
 */
export function SearchResults({ q, cityId, priceTier }: SearchResultsProps) {
  const router = useRouter();
  const cities = useQuery(api.taxonomy.listCities);

  const trimmed = q.trim();
  const pagination = usePaginatedQuery(
    api.restaurants.search,
    trimmed
      ? {
          q: trimmed,
          cityId: cityId ? (cityId as Id<"cities">) : undefined,
          priceTier,
        }
      : "skip",
    { initialNumItems: 12 },
  );

  function updateParams(next: {
    cityId?: string | null;
    priceTier?: PriceTierValue | null;
  }) {
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);

    const nextCity =
      next.cityId === undefined ? cityId : (next.cityId ?? undefined);
    if (nextCity) params.set("cityId", nextCity);

    const nextTier =
      next.priceTier === undefined ? priceTier : (next.priceTier ?? undefined);
    if (nextTier) params.set("priceTier", String(nextTier));

    router.replace(`/search?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <SearchBar defaultValue={trimmed} />

      {trimmed && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            المدينة
            <select
              value={cityId ?? ""}
              onChange={(event) =>
                updateParams({ cityId: event.target.value || null })
              }
              className="rounded-pill border border-ink/10 bg-surface px-3 py-1.5 text-ink"
            >
              <option value="">الكل</option>
              {cities?.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nameAr}
                </option>
              ))}
            </select>
          </label>

          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="مستوى السعر"
          >
            {([1, 2, 3, 4] as const).map((tier) => {
              const active = priceTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    updateParams({ priceTier: active ? null : tier })
                  }
                  className={[
                    "rounded-pill px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-accent-500 text-white"
                      : "bg-surface text-ink-muted ring-1 ring-ink/10 hover:bg-surface-muted",
                  ].join(" ")}
                >
                  {"$".repeat(tier)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {trimmed ? (
        <PaginatedGrid
          results={pagination.results}
          status={pagination.status as PaginationStatus}
          loadMore={pagination.loadMore}
          emptyMessage="لا توجد نتائج مطابقة لبحثك"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-card bg-surface-muted px-6 py-16 text-center">
          <span aria-hidden className="text-4xl">
            🔍
          </span>
          <p className="text-ink-muted">اكتب كلمة للبحث عن مطعم أو نوع أكل</p>
        </div>
      )}
    </div>
  );
}
