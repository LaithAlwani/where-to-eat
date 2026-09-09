import {
  query,
  mutation,
  internalMutation,
} from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { getViewer, requireAdmin } from "./lib/viewer";
import { applyRatingDelta } from "./lib/ratings";
import { notify } from "./lib/notify";
import { appError } from "./lib/errors";
import type { Id } from "./_generated/dataModel";

const restaurantStatus = v.union(
  v.literal("pending"),
  v.literal("published"),
  v.literal("rejected"),
  v.literal("closed"),
);
const reviewStatus = v.union(
  v.literal("visible"),
  v.literal("pending"),
  v.literal("hidden"),
);
const reportStatus = v.union(
  v.literal("open"),
  v.literal("actioned"),
  v.literal("dismissed"),
);
const userRole = v.union(
  v.literal("user"),
  v.literal("owner"),
  v.literal("admin"),
);

/** Bootstrap the first admin by email (run once via CLI). */
export const grantAdmin = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user) return appError("not_found", "no user with that email");
    await ctx.db.patch(user._id, { role: "admin" });
    return { ok: true, userId: user._id };
  },
});

/** Whether the viewer is an admin (drives UI gating). */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    return viewer?.role === "admin";
  },
});

/* ------------------------------- moderation ------------------------------- */

/** Restaurants awaiting review. */
export const pendingRestaurants = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    await requireAdmin(ctx);
    const results = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .paginate(paginationOpts);

    const page = await Promise.all(
      results.page.map(async (r) => {
        const submitter = r.submittedBy
          ? await ctx.db.get(r.submittedBy)
          : null;
        return {
          id: r._id,
          slug: r.slug,
          nameAr: r.nameAr,
          cityNameAr: r.cityNameAr,
          createdAt: r.createdAt,
          submittedByName: submitter?.name ?? null,
        };
      }),
    );
    return { ...results, page };
  },
});

/** Set a restaurant's status (publish / reject / close / reopen), with an
 * optional reason. Notifies the submitter on publish/reject. */
export const setRestaurantStatus = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    status: restaurantStatus,
    note: v.optional(v.string()),
  },
  handler: async (ctx, { restaurantId, status, note }) => {
    await requireAdmin(ctx);
    const restaurant = await ctx.db.get(restaurantId);
    if (!restaurant) return appError("not_found");

    await ctx.db.patch(restaurantId, {
      status,
      moderationNote: status === "rejected" ? note : undefined,
      updatedAt: Date.now(),
    });

    if (restaurant.submittedBy) {
      if (status === "published") {
        await notify(ctx, restaurant.submittedBy, {
          type: "submission_published",
          title: "تم نشر مطعمك 🎉",
          body: restaurant.nameAr,
          link: `/restaurant/${restaurant.slug}`,
        });
      } else if (status === "rejected") {
        await notify(ctx, restaurant.submittedBy, {
          type: "submission_rejected",
          title: `تم رفض «${restaurant.nameAr}»`,
          body: note,
          link: "/submissions",
        });
      }
    }
    return { ok: true };
  },
});

/** Ownership claims awaiting review, with restaurant + claimant context. */
export const pendingClaims = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    await requireAdmin(ctx);
    const results = await ctx.db
      .query("businessClaims")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .paginate(paginationOpts);

    const page = await Promise.all(
      results.page.map(async (c) => {
        const [restaurant, user] = await Promise.all([
          ctx.db.get(c.restaurantId),
          ctx.db.get(c.userId),
        ]);
        return {
          id: c._id,
          createdAt: c.createdAt,
          note: c.note ?? null,
          contactPhone: c.contactPhone ?? null,
          restaurant: restaurant
            ? { id: restaurant._id, slug: restaurant.slug, nameAr: restaurant.nameAr }
            : null,
          user: user
            ? { id: user._id, name: user.name, email: user.email }
            : null,
        };
      }),
    );
    return { ...results, page };
  },
});

/** Approve (grant ownership + promote) or reject a claim, with an optional
 * reason. Notifies the claimant either way. */
export const decideClaim = mutation({
  args: {
    claimId: v.id("businessClaims"),
    approve: v.boolean(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { claimId, approve, note }) => {
    await requireAdmin(ctx);
    const claim = await ctx.db.get(claimId);
    if (!claim) return appError("not_found");
    const restaurant = await ctx.db.get(claim.restaurantId);

    const now = Date.now();
    if (!approve) {
      await ctx.db.patch(claimId, {
        status: "rejected",
        decidedAt: now,
        decisionNote: note,
      });
      await notify(ctx, claim.userId, {
        type: "claim_rejected",
        title: `تم رفض طلب ملكية «${restaurant?.nameAr ?? "المكان"}»`,
        body: note,
        link: "/submissions",
      });
      return { ok: true };
    }

    await ctx.db.patch(claimId, {
      status: "approved",
      decidedAt: now,
      decisionNote: note,
    });
    await ctx.db.patch(claim.restaurantId, {
      ownerId: claim.userId,
      updatedAt: now,
    });
    const owner = await ctx.db.get(claim.userId);
    if (owner && owner.role === "user") {
      await ctx.db.patch(claim.userId, { role: "owner" });
    }
    await notify(ctx, claim.userId, {
      type: "claim_approved",
      title: `تمت الموافقة على ملكية «${restaurant?.nameAr ?? "المكان"}»`,
      body: "يمكنك الآن إدارة الصفحة من لوحة التحكم.",
      link: "/dashboard",
    });
    return { ok: true };
  },
});

/** Open reports with resolved target context (review or restaurant). */
export const openReports = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    await requireAdmin(ctx);
    const results = await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .paginate(paginationOpts);

    const page = await Promise.all(
      results.page.map(async (report) => {
        const reporter = await ctx.db.get(report.reporterId);
        let target:
          | { kind: "review"; id: string; body: string | null; authorName: string; restaurantSlug: string | null }
          | { kind: "restaurant"; id: string; nameAr: string; slug: string }
          | null = null;

        if (report.targetType === "review") {
          const review = await ctx.db.get(report.targetId as Id<"reviews">);
          if (review) {
            const restaurant = await ctx.db.get(review.restaurantId);
            target = {
              kind: "review",
              id: review._id,
              body: review.body ?? null,
              authorName: review.authorName,
              restaurantSlug: restaurant?.slug ?? null,
            };
          }
        } else {
          const restaurant = await ctx.db.get(
            report.targetId as Id<"restaurants">,
          );
          if (restaurant) {
            target = {
              kind: "restaurant",
              id: restaurant._id,
              nameAr: restaurant.nameAr,
              slug: restaurant.slug,
            };
          }
        }

        return {
          id: report._id,
          targetType: report.targetType,
          reason: report.reason,
          note: report.note ?? null,
          createdAt: report.createdAt,
          reporterName: reporter?.name ?? null,
          target,
        };
      }),
    );
    return { ...results, page };
  },
});

/** Resolve a report (actioned / dismissed). */
export const resolveReport = mutation({
  args: { reportId: v.id("reports"), status: reportStatus },
  handler: async (ctx, { reportId, status }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(reportId, { status });
    return { ok: true };
  },
});

/** Hide / unhide a review; keeps rating aggregates consistent. */
export const setReviewStatus = mutation({
  args: { reviewId: v.id("reviews"), status: reviewStatus },
  handler: async (ctx, { reviewId, status }) => {
    await requireAdmin(ctx);
    const review = await ctx.db.get(reviewId);
    if (!review) return appError("not_found");

    const wasVisible = review.status === "visible";
    const willBeVisible = status === "visible";
    await ctx.db.patch(reviewId, { status });

    if (wasVisible && !willBeVisible) {
      await applyRatingDelta(ctx, review.restaurantId, {
        oldRating: review.rating,
      });
    } else if (!wasVisible && willBeVisible) {
      await applyRatingDelta(ctx, review.restaurantId, {
        newRating: review.rating,
      });
    }
    return { ok: true };
  },
});

/* --------------------------------- users --------------------------------- */

/** Paginated user list for admin management. */
export const listUsers = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    await requireAdmin(ctx);
    const results = await ctx.db
      .query("users")
      .order("desc")
      .paginate(paginationOpts);
    return {
      ...results,
      page: results.page.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isBanned: u.isBanned,
        createdAt: u.createdAt,
      })),
    };
  },
});

/** Change a user's role. */
export const setUserRole = mutation({
  args: { userId: v.id("users"), role: userRole },
  handler: async (ctx, { userId, role }) => {
    const admin = await requireAdmin(ctx);
    if (admin._id === userId && role !== "admin") {
      return appError("forbidden", "cannot demote yourself");
    }
    await ctx.db.patch(userId, { role });
    return { ok: true };
  },
});

/** Ban / unban a user. */
export const setUserBanned = mutation({
  args: { userId: v.id("users"), banned: v.boolean() },
  handler: async (ctx, { userId, banned }) => {
    const admin = await requireAdmin(ctx);
    if (admin._id === userId) return appError("forbidden", "cannot ban yourself");
    await ctx.db.patch(userId, { isBanned: banned });
    return { ok: true };
  },
});

/* ------------------------------- taxonomy -------------------------------- */

export const addCity = mutation({
  args: { nameAr: v.string(), nameEn: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("cities")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return appError("invalid_input", "slug already exists");
    return ctx.db.insert("cities", { ...args, isActive: true });
  },
});

export const setCityActive = mutation({
  args: { cityId: v.id("cities"), isActive: v.boolean() },
  handler: async (ctx, { cityId, isActive }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(cityId, { isActive });
    return { ok: true };
  },
});

export const addNeighborhood = mutation({
  args: {
    cityId: v.id("cities"),
    nameAr: v.string(),
    nameEn: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.insert("neighborhoods", args);
  },
});

export const addCategory = mutation({
  args: {
    nameAr: v.string(),
    nameEn: v.string(),
    slug: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return appError("invalid_input", "slug already exists");
    return ctx.db.insert("categories", args);
  },
});

export const addCuisine = mutation({
  args: { nameAr: v.string(), nameEn: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("cuisines")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return appError("invalid_input", "slug already exists");
    return ctx.db.insert("cuisines", args);
  },
});
