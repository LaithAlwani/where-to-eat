"use client";

import { useState } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { inputClass, primaryBtnClass } from "@/lib/ui";
import { useToast } from "./ui/ToastProvider";
import { RatingStars } from "./RatingStars";

/** Owner editor tab: reviews with an inline reply/edit box per review. */
export function OwnerReviews({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.reviews.listByRestaurant,
    { restaurantId },
    { initialNumItems: 8 },
  );

  if (status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-card bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <p className="rounded-card bg-surface-muted px-4 py-10 text-center text-ink-muted">
        لا توجد تقييمات بعد.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {results.map((review) => (
        <OwnerReviewRow key={review.id} review={review} />
      ))}

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

function OwnerReviewRow({ review }: { review: Review }) {
  const { toast } = useToast();
  const respond = useMutation(api.owner.respondToReview);
  const [body, setBody] = useState(review.response?.body ?? "");
  const [editing, setEditing] = useState(review.response == null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!body.trim()) {
      toast({ title: "اكتب رداً أولاً", variant: "error" });
      return;
    }
    setBusy(true);
    try {
      await respond({ reviewId: review.id, body: body.trim() });
      toast({ title: "تم الحفظ", variant: "success" });
      setEditing(false);
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="flex flex-col gap-3 rounded-card bg-surface p-4 ring-1 ring-ink/5">
      <header className="flex items-center justify-between gap-3">
        <span className="font-medium text-ink">{review.authorName}</span>
        <div className="flex items-center gap-2">
          <RatingStars value={review.rating} size="sm" />
          <span className="text-xs text-ink-muted">
            {formatDate(review.createdAt)}
          </span>
        </div>
      </header>

      {review.body && <p className="leading-relaxed text-ink">{review.body}</p>}

      {review.response && !editing ? (
        <div className="rounded-card border-s-2 border-accent-400 bg-surface-muted p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-accent-700">ردّك</span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
            >
              تعديل
            </button>
          </div>
          <p className="mt-1 leading-relaxed text-ink">{review.response.body}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="اكتب رداً على هذا التقييم…"
          />
          <div className="flex justify-end gap-2">
            {review.response && (
              <button
                type="button"
                onClick={() => {
                  setBody(review.response?.body ?? "");
                  setEditing(false);
                }}
                disabled={busy}
                className="rounded-pill border border-ink-muted/30 px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-muted disabled:opacity-50"
              >
                إلغاء
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className={`${primaryBtnClass} px-5 py-1.5 text-sm`}
            >
              {busy ? "جارٍ…" : "إرسال الرد"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
