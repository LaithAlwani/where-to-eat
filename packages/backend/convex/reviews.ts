import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { RATING_MIN, RATING_MAX } from "@repo/shared/domain";
import { getViewer, requireViewer } from "./lib/viewer";
import { applyRatingDelta } from "./lib/ratings";
import { r2, resolveImageUrl, resolveImageUrls } from "./r2";
import { appError } from "./lib/errors";

function assertValidRating(rating: number) {
  if (!Number.isInteger(rating) || rating < RATING_MIN || rating > RATING_MAX) {
    appError("invalid_input", "rating must be an integer 1..5");
  }
}

/** Paginated visible reviews for a restaurant (newest first), author denormalized. */
export const listByRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { restaurantId, paginationOpts }) => {
    const viewer = await getViewer(ctx);
    const results = await ctx.db
      .query("reviews")
      .withIndex("by_restaurant_status", (q) =>
        q.eq("restaurantId", restaurantId).eq("status", "visible"),
      )
      .order("desc")
      .paginate(paginationOpts);

    const page = await Promise.all(
      results.page.map(async (r) => {
        const response = await ctx.db
          .query("ownerResponses")
          .withIndex("by_review", (q) => q.eq("reviewId", r._id))
          .unique();
        return {
          id: r._id,
          rating: r.rating,
          body: r.body ?? null,
          authorName: r.authorName,
          authorAvatarUrl: await resolveImageUrl(r.authorAvatarKey),
          photoUrls: await resolveImageUrls(r.photoKeys),
          createdAt: r.createdAt,
          editedAt: r.editedAt ?? null,
          isMine: viewer ? r.userId === viewer._id : false,
          response: response
            ? { body: response.body, createdAt: response.createdAt }
            : null,
        };
      }),
    );
    return { ...results, page };
  },
});

/** The viewer's own review for a restaurant (for the edit form), or null. */
export const getMine = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;

    const review = await ctx.db
      .query("reviews")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("userId", viewer._id).eq("restaurantId", restaurantId),
      )
      .unique();
    if (!review) return null;

    return {
      id: review._id,
      rating: review.rating,
      body: review.body ?? null,
      photoKeys: review.photoKeys,
      photoUrls: await resolveImageUrls(review.photoKeys),
    };
  },
});

/**
 * Create a review — one per user per restaurant; updates aggregates atomically.
 * Photos are uploaded AFTER creation (into a reviews/<reviewId>/ folder) and
 * attached via `attachPhotos`, so nothing is stored in R2 until the review is
 * actually saved.
 */
export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    rating: v.number(),
    body: v.optional(v.string()),
  },
  handler: async (ctx, { restaurantId, rating, body }) => {
    const user = await requireViewer(ctx);
    assertValidRating(rating);

    const restaurant = await ctx.db.get(restaurantId);
    if (!restaurant) return appError("not_found");

    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("userId", user._id).eq("restaurantId", restaurantId),
      )
      .unique();
    if (existing) return appError("duplicate_review");

    const now = Date.now();
    const reviewId = await ctx.db.insert("reviews", {
      restaurantId,
      userId: user._id,
      authorName: user.name,
      authorAvatarKey: user.avatarKey,
      rating,
      body,
      photoKeys: [],
      status: "visible",
      createdAt: now,
      updatedAt: now,
    });

    await applyRatingDelta(ctx, restaurantId, { newRating: rating });
    return reviewId;
  },
});

/** Edit the viewer's own review (rating + body); photos via `attachPhotos`. */
export const update = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.number(),
    body: v.optional(v.string()),
  },
  handler: async (ctx, { reviewId, rating, body }) => {
    const user = await requireViewer(ctx);
    assertValidRating(rating);

    const review = await ctx.db.get(reviewId);
    if (!review) return appError("not_found");
    if (review.userId !== user._id) return appError("forbidden");

    const oldRating = review.rating;
    const now = Date.now();
    await ctx.db.patch(reviewId, {
      rating,
      body,
      updatedAt: now,
      editedAt: now,
    });

    await applyRatingDelta(ctx, review.restaurantId, {
      oldRating,
      newRating: rating,
    });
  },
});

/**
 * Presign an upload URL for a review photo. The client generates the key as
 * `reviews/<reviewId>/<uuid>`; we verify the caller owns the review and that
 * the key is scoped to that review's folder before signing.
 */
export const generateUploadUrl = mutation({
  args: { reviewId: v.id("reviews"), key: v.string() },
  handler: async (ctx, { reviewId, key }) => {
    const user = await requireViewer(ctx);
    const review = await ctx.db.get(reviewId);
    if (!review) return appError("not_found");
    if (review.userId !== user._id) return appError("forbidden");
    if (!key.startsWith(`reviews/${reviewId}/`)) {
      return appError("invalid_input", "key must be scoped to the review");
    }
    return r2.generateUploadUrl(key);
  },
});

/**
 * Set the review's photos to exactly `photoKeys` (owner only). Any previously
 * attached key no longer present is deleted from R2 — so removing a photo or
 * deleting the review cleans up storage.
 */
export const attachPhotos = mutation({
  args: { reviewId: v.id("reviews"), photoKeys: v.array(v.string()) },
  handler: async (ctx, { reviewId, photoKeys }) => {
    const user = await requireViewer(ctx);
    const review = await ctx.db.get(reviewId);
    if (!review) return appError("not_found");
    if (review.userId !== user._id) return appError("forbidden");

    const removed = review.photoKeys.filter((k) => !photoKeys.includes(k));
    await Promise.all(removed.map((key) => r2.deleteObject(ctx, key)));

    await ctx.db.patch(reviewId, { photoKeys, updatedAt: Date.now() });
    return { ok: true };
  },
});

/** Delete a review (owner or admin); decrements aggregates and removes photos. */
export const remove = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, { reviewId }) => {
    const user = await requireViewer(ctx);
    const review = await ctx.db.get(reviewId);
    if (!review) return;

    const isOwner = review.userId === user._id;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) return appError("forbidden");

    await Promise.all(review.photoKeys.map((key) => r2.deleteObject(ctx, key)));
    await applyRatingDelta(ctx, review.restaurantId, {
      oldRating: review.rating,
    });
    await ctx.db.delete(reviewId);
  },
});
