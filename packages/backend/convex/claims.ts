import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getViewer, requireViewer } from "./lib/viewer";
import { appError } from "./lib/errors";

/**
 * Claim ownership of a restaurant page. Files a pending businessClaim for admin
 * review. Deduped: an existing pending claim by the same user is reused.
 */
export const claim = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    contactPhone: v.optional(v.string()),
    note: v.optional(v.string()),
    evidence: v.optional(v.string()),
  },
  handler: async (ctx, { restaurantId, contactPhone, note, evidence }) => {
    const user = await requireViewer(ctx);

    const restaurant = await ctx.db.get(restaurantId);
    if (!restaurant) return appError("not_found");
    if (restaurant.ownerId) return appError("forbidden", "already claimed");

    const mine = await ctx.db
      .query("businessClaims")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const pending = mine.find(
      (c) => c.restaurantId === restaurantId && c.status === "pending",
    );
    if (pending) return { id: pending._id, duplicate: true };

    const id = await ctx.db.insert("businessClaims", {
      restaurantId,
      userId: user._id,
      status: "pending",
      contactPhone,
      note,
      evidence,
      createdAt: Date.now(),
    });
    return { id, duplicate: false };
  },
});

/** The viewer's claims with the target restaurant's name + status. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return [];

    const claims = await ctx.db
      .query("businessClaims")
      .withIndex("by_user", (q) => q.eq("userId", viewer._id))
      .order("desc")
      .take(50);

    return Promise.all(
      claims.map(async (c) => {
        const restaurant = await ctx.db.get(c.restaurantId);
        return {
          id: c._id,
          status: c.status,
          createdAt: c.createdAt,
          decisionNote: c.decisionNote ?? null,
          restaurant: restaurant
            ? { slug: restaurant.slug, nameAr: restaurant.nameAr }
            : null,
        };
      }),
    );
  },
});

/**
 * Approve a claim: grants ownership and promotes the user to "owner".
 * Admin/dev bridge (run via CLI or the Phase 5 admin UI):
 *   npx convex run claims:approve '{"claimId":"..."}'
 */
export const approve = internalMutation({
  args: { claimId: v.id("businessClaims") },
  handler: async (ctx, { claimId }) => {
    const claim = await ctx.db.get(claimId);
    if (!claim) return appError("not_found");

    await ctx.db.patch(claimId, { status: "approved", decidedAt: Date.now() });
    await ctx.db.patch(claim.restaurantId, {
      ownerId: claim.userId,
      updatedAt: Date.now(),
    });

    const owner = await ctx.db.get(claim.userId);
    if (owner && owner.role === "user") {
      await ctx.db.patch(claim.userId, { role: "owner" });
    }
    return { ok: true };
  },
});

/** Reject a claim (admin/dev bridge). */
export const reject = internalMutation({
  args: { claimId: v.id("businessClaims") },
  handler: async (ctx, { claimId }) => {
    await ctx.db.patch(claimId, { status: "rejected", decidedAt: Date.now() });
    return { ok: true };
  },
});
