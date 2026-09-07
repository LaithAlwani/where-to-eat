"use client";

import { useState } from "react";
import { useConvexAuth, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { RatingSummary } from "./RatingSummary";
import { ReviewForm } from "./ReviewForm";
import { ReviewCard } from "./ReviewCard";

type ReviewsSectionProps = {
  restaurantId: Id<"restaurants">;
  avg: number;
  count: number;
  buckets: number[];
};

/**
 * Reviews block: rating distribution, the viewer's own review affordance
 * (add or edit), then the paginated list of everyone's reviews.
 */
export function ReviewsSection({
  restaurantId,
  avg,
  count,
  buckets,
}: ReviewsSectionProps) {
  const { isAuthenticated } = useConvexAuth();
  const mine = useQuery(
    api.reviews.getMine,
    isAuthenticated ? { restaurantId } : "skip",
  );
  const [editing, setEditing] = useState(false);

  const hasMine = mine != null;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-ink">التقييمات</h2>

      <RatingSummary avg={avg} count={count} buckets={buckets} />

      {isAuthenticated ? (
        hasMine && !editing ? (
          <div className="flex items-center justify-between gap-3 rounded-card bg-surface-muted px-4 py-3">
            <span className="text-ink-muted">لقد قيّمت هذا المكان</span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-pill bg-brand-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              عدّل تقييمك
            </button>
          </div>
        ) : (
          <div className="rounded-card bg-surface p-4 ring-1 ring-ink/5">
            <ReviewForm
              restaurantId={restaurantId}
              existing={
                hasMine
                  ? {
                      id: mine.id,
                      rating: mine.rating,
                      body: mine.body,
                      photoKeys: mine.photoKeys,
                    }
                  : null
              }
              onDone={() => setEditing(false)}
            />
          </div>
        )
      ) : (
        <div className="rounded-card bg-surface-muted px-4 py-6 text-center text-ink-muted">
          سجّل الدخول لكتابة تقييم
        </div>
      )}

      <PaginatedReviews restaurantId={restaurantId} />
    </div>
  );
}

function PaginatedReviews({ restaurantId }: { restaurantId: Id<"restaurants"> }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.reviews.listByRestaurant,
    { restaurantId },
    { initialNumItems: 8 },
  );

  if (status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-card bg-surface-muted px-4 py-10 text-center text-ink-muted">
        لا توجد تقييمات بعد — كن أول من يشارك تجربته
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {results.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            restaurantId={restaurantId}
          />
        ))}
      </div>

      {(status === "CanLoadMore" || status === "LoadingMore") && (
        <button
          type="button"
          onClick={() => loadMore(8)}
          disabled={status === "LoadingMore"}
          className="mx-auto rounded-pill bg-surface px-6 py-2 font-medium text-ink ring-1 ring-ink/10 transition hover:bg-surface-muted disabled:opacity-50"
        >
          {status === "LoadingMore" ? "جارٍ التحميل…" : "تحميل المزيد"}
        </button>
      )}
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3 rounded-card bg-surface p-4 ring-1 ring-ink/5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-surface-muted" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-24 rounded bg-surface-muted" />
          <div className="h-2.5 w-16 rounded bg-surface-muted" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-surface-muted" />
      <div className="h-3 w-2/3 rounded bg-surface-muted" />
    </div>
  );
}
