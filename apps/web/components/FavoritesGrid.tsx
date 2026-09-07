"use client";

import Link from "next/link";
import { useConvexAuth, usePaginatedQuery } from "convex/react";
import { api } from "@repo/backend";
import { PaginatedGrid, type PaginationStatus } from "./PaginatedGrid";

/**
 * The viewer's saved restaurants. Unauthenticated visitors get a sign-in
 * prompt; otherwise a paginated grid with an empty state when nothing's saved.
 */
export function FavoritesGrid() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { results, status, loadMore } = usePaginatedQuery(
    api.favorites.listMine,
    isAuthenticated ? {} : "skip",
    { initialNumItems: 12 },
  );

  if (isLoading) {
    return <p className="text-ink-muted">جارٍ التحميل…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-4xl">
          ❤️
        </span>
        <p className="text-ink-muted">سجّل الدخول لعرض المفضلة</p>
        <Link
          href="/"
          className="mt-1 rounded-pill bg-brand-500 px-6 py-2 font-medium text-white transition hover:bg-brand-600"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <PaginatedGrid
      results={results}
      status={status as PaginationStatus}
      loadMore={loadMore}
      emptyMessage="لم تحفظ أي مكان بعد"
    />
  );
}
