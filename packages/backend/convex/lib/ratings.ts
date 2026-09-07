import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

function normalizeBuckets(buckets: number[] | undefined): number[] {
  return buckets && buckets.length === 5 ? [...buckets] : [0, 0, 0, 0, 0];
}

/**
 * Transactionally update a restaurant's denormalized rating aggregates
 * (avg, count, star distribution) by a review delta — so reads never scan
 * reviews to compute an average.
 *
 * - create: `{ newRating }`
 * - edit:   `{ oldRating, newRating }`
 * - delete: `{ oldRating }`
 */
export async function applyRatingDelta(
  ctx: MutationCtx,
  restaurantId: Id<"restaurants">,
  delta: { oldRating?: number; newRating?: number },
): Promise<void> {
  const restaurant = await ctx.db.get(restaurantId);
  if (!restaurant) return;

  let count = restaurant.ratingCount;
  let sum = restaurant.ratingAvg * restaurant.ratingCount;
  const buckets = normalizeBuckets(restaurant.ratingBuckets);

  if (delta.oldRating != null) {
    sum -= delta.oldRating;
    if (delta.newRating == null) count -= 1;
    const i = delta.oldRating - 1;
    buckets[i] = Math.max(0, (buckets[i] ?? 0) - 1);
  }
  if (delta.newRating != null) {
    sum += delta.newRating;
    if (delta.oldRating == null) count += 1;
    const i = delta.newRating - 1;
    buckets[i] = (buckets[i] ?? 0) + 1;
  }

  const safeCount = Math.max(0, count);
  const avg = safeCount > 0 ? Math.round((sum / safeCount) * 100) / 100 : 0;

  await ctx.db.patch(restaurantId, {
    ratingCount: safeCount,
    ratingAvg: avg,
    ratingBuckets: buckets,
    updatedAt: Date.now(),
  });
}
