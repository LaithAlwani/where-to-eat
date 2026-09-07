import { toEasternArabicDigits } from "@repo/shared/arabic";
import { RatingStars } from "./RatingStars";

type RatingSummaryProps = {
  avg: number;
  count: number;
  /** length 5, index 0 = count of 1★ … index 4 = count of 5★. */
  buckets: number[];
};

/**
 * Rating overview: a big average with stars, plus a ★5→★1 distribution with
 * proportional bars. Empty state when there are no reviews yet.
 */
export function RatingSummary({ avg, count, buckets }: RatingSummaryProps) {
  if (count === 0) {
    return (
      <div className="rounded-card bg-surface-muted px-4 py-8 text-center text-ink-muted">
        لا توجد تقييمات بعد
      </div>
    );
  }

  const rows = [5, 4, 3, 2, 1] as const;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex flex-col items-center gap-1">
        <span className="text-4xl font-extrabold text-ink">
          {toEasternArabicDigits(avg.toFixed(1))}
        </span>
        <RatingStars value={avg} size="md" />
        <span className="text-sm text-ink-muted">
          {toEasternArabicDigits(count)} تقييم
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {rows.map((star) => {
          const n = buckets[star - 1] ?? 0;
          const pct = count > 0 ? (n / count) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-10 shrink-0 text-ink-muted">
                {toEasternArabicDigits(star)} ★
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-pill bg-ink/10">
                <div
                  className="h-full rounded-pill bg-amber-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-start text-ink-muted">
                {toEasternArabicDigits(n)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
