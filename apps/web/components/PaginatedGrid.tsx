"use client";

import type { RestaurantCard as Card } from "@/lib/types";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantCardSkeleton } from "./RestaurantCardSkeleton";

export type PaginationStatus =
  | "LoadingFirstPage"
  | "CanLoadMore"
  | "LoadingMore"
  | "Exhausted";

type PaginatedGridProps = {
  results: Card[];
  status: PaginationStatus;
  loadMore: (numItems: number) => void;
  emptyMessage?: string;
  pageSize?: number;
};

/**
 * Reusable results grid over a usePaginatedQuery result. First-class states:
 * skeletons on LoadingFirstPage, empty state when exhausted with no results,
 * and a "تحميل المزيد" button while more pages remain. Shared by search,
 * category, and cuisine pages.
 */
export function PaginatedGrid({
  results,
  status,
  loadMore,
  emptyMessage = "لا توجد نتائج",
  pageSize = 12,
}: PaginatedGridProps) {
  if (status === "LoadingFirstPage") {
    return (
      <Grid>
        {Array.from({ length: pageSize }).map((_, i) => (
          <RestaurantCardSkeleton key={i} />
        ))}
      </Grid>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-4xl">
          🍽️
        </span>
        <p className="text-ink-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <Grid>
        {results.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </Grid>

      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <button
          type="button"
          onClick={() => loadMore(pageSize)}
          disabled={status === "LoadingMore"}
          className="rounded-pill bg-brand-500 px-8 py-3 font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {status === "LoadingMore" ? "جارٍ التحميل…" : "تحميل المزيد"}
        </button>
      ) : null}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
}
