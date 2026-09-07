import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getViewer } from "./lib/viewer";
import { requireRestaurantOwner } from "./lib/ownership";
import { appError } from "./lib/errors";
import { computeSearchText, syncJoinRows } from "./lib/restaurantWrite";
import { resolveImageUrl, resolveImageUrls } from "./r2";
import type { Doc } from "./_generated/dataModel";

const priceTier = v.union(
  v.literal(1),
  v.literal(2),
  v.literal(3),
  v.literal(4),
);

const openingHours = v.array(
  v.object({
    day: v.number(),
    open: v.optional(v.string()),
    close: v.optional(v.string()),
    closed: v.optional(v.boolean()),
  }),
);

const menuSections = v.array(
  v.object({
    nameAr: v.string(),
    nameEn: v.optional(v.string()),
    items: v.array(
      v.object({
        nameAr: v.string(),
        nameEn: v.optional(v.string()),
        price: v.optional(v.number()),
        currency: v.optional(v.string()),
        descriptionAr: v.optional(v.string()),
        imageKey: v.optional(v.string()),
        isAvailable: v.optional(v.boolean()),
      }),
    ),
  }),
);

/** Restaurants owned by the viewer (any status), with light status info. */
export const listMyRestaurants = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return [];

    const rows = await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", viewer._id))
      .take(50);

    return Promise.all(
      rows.map(async (r) => ({
        id: r._id,
        slug: r.slug,
        nameAr: r.nameAr,
        status: r.status,
        ratingAvg: r.ratingAvg,
        ratingCount: r.ratingCount,
        coverUrl: await resolveImageUrl(r.coverKey),
      })),
    );
  },
});

/** Full editable restaurant for the owner dashboard (owner/admin only). */
export const getMyRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;

    const r = await ctx.db.get(restaurantId);
    if (!r) return null;
    if (r.ownerId !== viewer._id && viewer.role !== "admin") return null;

    const [categories, cuisines, menu, coverUrl, photoUrls] = await Promise.all([
      Promise.all(r.categoryIds.map((id) => ctx.db.get(id))),
      Promise.all(r.cuisineIds.map((id) => ctx.db.get(id))),
      ctx.db
        .query("menus")
        .withIndex("by_restaurant", (q) => q.eq("restaurantId", r._id))
        .unique(),
      resolveImageUrl(r.coverKey),
      resolveImageUrls(r.photoKeys),
    ]);

    return {
      id: r._id,
      slug: r.slug,
      status: r.status,
      nameAr: r.nameAr,
      nameEn: r.nameEn ?? null,
      descriptionAr: r.descriptionAr ?? null,
      descriptionEn: r.descriptionEn ?? null,
      priceTier: r.priceTier,
      phone: r.phone ?? null,
      whatsapp: r.whatsapp ?? null,
      instagram: r.instagram ?? null,
      website: r.website ?? null,
      address: r.address ?? null,
      hours: r.hours ?? null,
      coverKey: r.coverKey ?? null,
      coverUrl,
      photoKeys: r.photoKeys,
      photoUrls,
      categorySlugs: categories
        .filter((c): c is Doc<"categories"> => c !== null)
        .map((c) => c.slug),
      cuisineSlugs: cuisines
        .filter((c): c is Doc<"cuisines"> => c !== null)
        .map((c) => c.slug),
      menu: menu ? menu.sections : null,
    };
  },
});

/** Update editable restaurant info (owner/admin). Rebuilds search + join rows. */
export const updateInfo = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    nameAr: v.string(),
    nameEn: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    priceTier,
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    instagram: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.string()),
    hours: v.optional(openingHours),
    categorySlugs: v.array(v.string()),
    cuisineSlugs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { restaurant } = await requireRestaurantOwner(ctx, args.restaurantId);

    const city = await ctx.db.get(restaurant.cityId);
    if (!city) return appError("not_found");
    const neighborhood = restaurant.neighborhoodId
      ? await ctx.db.get(restaurant.neighborhoodId)
      : null;

    const categories = (
      await Promise.all(
        args.categorySlugs.map((slug) =>
          ctx.db
            .query("categories")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .unique(),
        ),
      )
    ).filter((d): d is Doc<"categories"> => d !== null);
    const cuisines = (
      await Promise.all(
        args.cuisineSlugs.map((slug) =>
          ctx.db
            .query("cuisines")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .unique(),
        ),
      )
    ).filter((d): d is Doc<"cuisines"> => d !== null);

    const searchText = computeSearchText(args.nameAr, args.nameEn, {
      city,
      neighborhood,
      categories,
      cuisines,
    });

    await ctx.db.patch(args.restaurantId, {
      nameAr: args.nameAr,
      nameEn: args.nameEn,
      descriptionAr: args.descriptionAr,
      descriptionEn: args.descriptionEn,
      priceTier: args.priceTier,
      phone: args.phone,
      whatsapp: args.whatsapp,
      instagram: args.instagram,
      website: args.website,
      address: args.address,
      hours: args.hours,
      categoryIds: categories.map((c) => c._id),
      cuisineIds: cuisines.map((c) => c._id),
      searchText,
      updatedAt: Date.now(),
    });

    await syncJoinRows(
      ctx,
      args.restaurantId,
      categories.map((c) => c._id),
      cuisines.map((c) => c._id),
    );
    return { ok: true };
  },
});

/** Set the cover + gallery photo keys (owner/admin). Keys come from R2 upload. */
export const setPhotos = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    coverKey: v.optional(v.string()),
    photoKeys: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { restaurantId, coverKey, photoKeys }) => {
    await requireRestaurantOwner(ctx, restaurantId);
    await ctx.db.patch(restaurantId, {
      coverKey,
      photoKeys: photoKeys ?? [],
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

/** Upsert the restaurant's menu (owner/admin). */
export const updateMenu = mutation({
  args: { restaurantId: v.id("restaurants"), sections: menuSections },
  handler: async (ctx, { restaurantId, sections }) => {
    await requireRestaurantOwner(ctx, restaurantId);
    const existing = await ctx.db
      .query("menus")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { sections, updatedAt: now });
    } else {
      await ctx.db.insert("menus", { restaurantId, sections, updatedAt: now });
    }
    return { ok: true };
  },
});

/** Owner reply to a review (upsert one response per review). */
export const respondToReview = mutation({
  args: { reviewId: v.id("reviews"), body: v.string() },
  handler: async (ctx, { reviewId, body }) => {
    const review = await ctx.db.get(reviewId);
    if (!review) return appError("not_found");
    const { user } = await requireRestaurantOwner(ctx, review.restaurantId);

    const existing = await ctx.db
      .query("ownerResponses")
      .withIndex("by_review", (q) => q.eq("reviewId", reviewId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { body });
    } else {
      await ctx.db.insert("ownerResponses", {
        reviewId,
        restaurantId: review.restaurantId,
        ownerId: user._id,
        body,
        createdAt: Date.now(),
      });
    }
    return { ok: true };
  },
});
