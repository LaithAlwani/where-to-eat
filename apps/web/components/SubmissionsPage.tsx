"use client";

import Link from "next/link";
import { useConvexAuth, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@repo/backend";
import { formatDate } from "@/lib/format";
import { primaryBtnClass } from "@/lib/ui";
import { StatusBadge } from "./StatusBadge";

/**
 * "طلباتي": the signed-in user's proposed restaurants (with resubmit access on
 * rejection) and their ownership claims. Auth-gated with first-class states.
 */
export function SubmissionsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <p className="text-ink-muted">جارٍ التحميل…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-5xl">
          🔐
        </span>
        <h2 className="text-xl font-bold text-ink">سجّل الدخول لعرض طلباتك</h2>
        <p className="text-ink-muted">
          سجّل الدخول من زر «الحساب» في الأعلى لمتابعة طلباتك.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <SubmittedRestaurants />
      <OwnershipClaims />
    </div>
  );
}

function SubmittedRestaurants() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.submissions.listMine,
    {},
    { initialNumItems: 12 },
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-ink">المطاعم المقترحة</h2>

      {status === "LoadingFirstPage" ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-card bg-surface-muted"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card bg-surface-muted px-6 py-12 text-center">
          <span aria-hidden className="text-3xl">
            🍽️
          </span>
          <p className="text-ink-muted">لم تقترح أي مطعم بعد</p>
          <Link href="/submit" className={primaryBtnClass}>
            أضف مطعماً
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-2 rounded-card bg-surface p-4 ring-1 ring-ink/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-ink">
                    {item.nameAr}
                  </span>
                  <span className="text-sm text-ink-muted">
                    {item.cityNameAr}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-ink-muted">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>

              {item.status === "rejected" && item.moderationNote && (
                <p className="rounded-card bg-red-50 p-3 text-sm leading-relaxed text-red-700">
                  سبب الرفض: {item.moderationNote}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {item.status === "rejected" && (
                  <Link
                    href={`/submissions/${item.id}`}
                    className="rounded-pill bg-brand-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-600"
                  >
                    تعديل وإعادة الإرسال
                  </Link>
                )}
                {item.status === "published" && (
                  <Link
                    href={`/restaurant/${item.slug}`}
                    className="rounded-pill border border-ink/10 px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-muted"
                  >
                    عرض الصفحة
                  </Link>
                )}
              </div>
            </article>
          ))}

          {(status === "CanLoadMore" || status === "LoadingMore") && (
            <button
              type="button"
              onClick={() => loadMore(12)}
              disabled={status === "LoadingMore"}
              className="mx-auto rounded-pill bg-surface px-6 py-2 font-medium text-ink ring-1 ring-ink/10 transition hover:bg-surface-muted disabled:opacity-50"
            >
              {status === "LoadingMore" ? "جارٍ التحميل…" : "تحميل المزيد"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function OwnershipClaims() {
  const claims = useQuery(api.claims.listMine, {});

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-ink">طلبات الملكية</h2>

      {claims === undefined ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-card bg-surface-muted"
            />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card bg-surface-muted px-6 py-12 text-center">
          <span aria-hidden className="text-3xl">
            🏷️
          </span>
          <p className="text-ink-muted">لم تقدّم أي طلب ملكية بعد</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {claims.map((claim) => (
            <article
              key={claim.id}
              className="flex flex-col gap-2 rounded-card bg-surface p-4 ring-1 ring-ink/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {claim.restaurant ? (
                  <Link
                    href={`/restaurant/${claim.restaurant.slug}`}
                    className="text-lg font-bold text-ink transition hover:text-brand-600"
                  >
                    {claim.restaurant.nameAr}
                  </Link>
                ) : (
                  <span className="text-lg font-bold text-ink-muted">
                    مكان محذوف
                  </span>
                )}
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={claim.status} />
                  <span className="text-xs text-ink-muted">
                    {formatDate(claim.createdAt)}
                  </span>
                </div>
              </div>

              {claim.status === "rejected" && (
                <>
                  {claim.decisionNote && (
                    <p className="rounded-card bg-red-50 p-3 text-sm leading-relaxed text-red-700">
                      سبب الرفض: {claim.decisionNote}
                    </p>
                  )}
                  <p className="text-sm text-ink-muted">
                    يمكنك تقديم طلب جديد من صفحة المطعم
                    {claim.restaurant && (
                      <>
                        {" — "}
                        <Link
                          href={`/restaurant/${claim.restaurant.slug}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          افتح صفحة المطعم
                        </Link>
                      </>
                    )}
                  </p>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
