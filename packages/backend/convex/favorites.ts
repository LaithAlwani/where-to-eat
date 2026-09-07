import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { getViewer, requireViewer } from "./lib/viewer";
import { toCards } from "./lib/cards";
import type { Doc } from "./_generated/dataModel";

/** Toggle the restaurant in the viewer's favorites. Returns the new state. */
export const toggle = mutation({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const user = await requireViewer(ctx);
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("userId", user._id).eq("restaurantId", restaurantId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false };
    }
    await ctx.db.insert("favorites", {
      userId: user._id,
      restaurantId,
      createdAt: Date.now(),
    });
    return { favorited: true };
  },
});

/** Whether the viewer has favorited a restaurant (false if unauthenticated). */
export const isFavorite = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return false;
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("userId", viewer._id).eq("restaurantId", restaurantId),
      )
      .unique();
    return existing !== null;
  },
});

/** The viewer's saved restaurants as cards (paginated). */
export const listMine = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return { page: [], isDone: true, continueCursor: "" };

    const results = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", viewer._id))
      .order("desc")
      .paginate(paginationOpts);

    const docs = await Promise.all(
      results.page.map((f) => ctx.db.get(f.restaurantId)),
    );
    const published = docs.filter(
      (d): d is Doc<"restaurants"> => d !== null && d.status === "published",
    );
    return { ...results, page: await toCards(published) };
  },
});
