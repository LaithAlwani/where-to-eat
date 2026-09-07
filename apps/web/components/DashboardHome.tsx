"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@repo/backend";
import { primaryBtnClass } from "@/lib/ui";
import { formatDate } from "@/lib/format";
import { CoverImage } from "./CoverImage";
import { RatingStars } from "./RatingStars";
import { StatusBadge } from "./StatusBadge";

/**
 * Owner dashboard landing: the viewer's restaurants (any status) and their
 * business-claim requests. Auth-gated with first-class loading/empty states.
 */
export function DashboardHome() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const restaurants = useQuery(
    api.owner.listMyRestaurants,
    isAuthenticated ? {} : "skip",
  );
  const claims = useQuery(
    api.claims.listMine,
    isAuthenticated ? {} : "skip",
  );

  if (isLoading) {
    return <p className="text-ink-muted">جارٍ التحميل…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-5xl">
          🔐
        </span>
        <h2 className="text-xl font-bold text-ink">سجّل الدخول لعرض لوحة التحكم</h2>
        <p className="text-ink-muted">
          سجّل الدخول من زر «الحساب» في الأعلى لإدارة مطاعمك.
        </p>
      </div>
    );
  }

  const loading = restaurants === undefined || claims === undefined;
  const noRestaurants = (restaurants?.length ?? 0) === 0;
  const noClaims = (claims?.length ?? 0) === 0;

  if (!loading && noRestaurants && noClaims) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-5xl">
          🍽️
        </span>
        <h2 className="text-xl font-bold text-ink">لا توجد مطاعم بعد</h2>
        <p className="text-ink-muted">
          أضف مطعمك أو طالِب بصفحة مكان موجود لتبدأ الإدارة.
        </p>
        <Link href="/submit" className={primaryBtnClass}>
          أضف مطعمك
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">مطاعمي</h2>
          <Link
            href="/submit"
            className="rounded-pill border border-ink/10 px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-muted"
          >
            ＋ أضف مطعماً
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-card bg-surface-muted"
              />
            ))}
          </div>
        ) : noRestaurants ? (
          <p className="rounded-card bg-surface-muted px-4 py-8 text-center text-ink-muted">
            لم تُضِف أي مطعم بعد.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {restaurants?.map((r) => (
              <Link
                key={r.id}
                href={`/dashboard/${r.id}`}
                className="group flex items-center gap-3 rounded-card bg-surface p-3 ring-1 ring-ink/5 transition hover:shadow-md"
              >
                <CoverImage
                  url={r.coverUrl}
                  nameAr={r.nameAr}
                  className="h-16 w-16 shrink-0"
                  glyphClassName="text-2xl"
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-bold text-ink transition group-hover:text-brand-600">
                    {r.nameAr}
                  </span>
                  <StatusBadge status={r.status} />
                  <RatingStars value={r.ratingAvg} count={r.ratingCount} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-ink">طلبات المطالبة</h2>

        {loading ? (
          <div className="h-16 animate-pulse rounded-card bg-surface-muted" />
        ) : noClaims ? (
          <p className="rounded-card bg-surface-muted px-4 py-8 text-center text-ink-muted">
            لا توجد طلبات مطالبة.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {claims?.map((claim) => (
              <li
                key={claim.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface p-3 ring-1 ring-ink/5"
              >
                <div className="flex flex-col gap-1">
                  {claim.restaurant ? (
                    <Link
                      href={`/restaurant/${claim.restaurant.slug}`}
                      className="font-medium text-ink transition hover:text-brand-600"
                    >
                      {claim.restaurant.nameAr}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink-muted">مكان محذوف</span>
                  )}
                  <span className="text-xs text-ink-muted">
                    {formatDate(claim.createdAt)}
                  </span>
                </div>
                <StatusBadge status={claim.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
