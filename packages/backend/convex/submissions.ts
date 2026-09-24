import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { slugify } from "@repo/shared/slug";
import { getViewer, requireViewer } from "./lib/viewer";
import { appError } from "./lib/errors";
import {
  resolveTaxonomy,
  computeSearchText,
  syncJoinRows,
} from "./lib/restaurantWrite";
import { r2, resolveImageUrl, resolveImageUrls } from "./r2";
import type { Doc, Id } from "./_generated/dataModel";

const priceTier = v.union(
  v.literal(1),
  v.literal(2),
  v.literal(3),
  v.literal(4),
);

/** Ensure a unique slug: base, else base-<timestamp36>. */
async function uniqueSlug(ctx: MutationCtx, base: string): Promise<string> {
  const clean = base || "matam";
  const existing = await ctx.db
    .query("restaurants")
    .withIndex("by_slug", (q) => q.eq("slug", clean))
    .unique();
  if (!existing) return clean;
  return `${clean}-${Date.now().toString(36)}`;
}

/**
 * Community submission of a new restaurant. Created as `pending` (awaiting admin
 * review), attributed to the submitter. Anyone signed in may submit.
 */
export const submit = mutation({
  args: {
    nameAr: v.string(),
    nameEn: v.optional(v.string()),
    citySlug: v.string(),
    neighborhoodSlug: v.optional(v.string()),
    categorySlugs: v.array(v.string()),
    cuisineSlugs: v.array(v.string()),
    priceTier,
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    instagram: v.optional(v.string()),
    website: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    address: v.optional(v.string()),
    // Submitter states they own the place → auto-file a claim for verification.
    claimOwnership: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireViewer(ctx);

    const tax = await resolveTaxonomy(ctx, {
      citySlug: args.citySlug,
      neighborhoodSlug: args.neighborhoodSlug,
      categorySlugs: args.categorySlugs,
      cuisineSlugs: args.cuisineSlugs,
    });
    if (!tax) return appError("invalid_input", "unknown city");

    const slug = await uniqueSlug(ctx, slugify(args.nameEn ?? ""));
    const now = Date.now();

    const restaurantId = await ctx.db.insert("restaurants", {
      nameAr: args.nameAr,
      nameEn: args.nameEn,
      slug,
      descriptionAr: args.descriptionAr,
      cityId: tax.city._id,
      neighborhoodId: tax.neighborhood?._id,
      cityNameAr: tax.city.nameAr,
      neighborhoodNameAr: tax.neighborhood?.nameAr,
      address: args.address,
      categoryIds: tax.categories.map((c) => c._id),
      cuisineIds: tax.cuisines.map((c) => c._id),
      priceTier: args.priceTier,
      phone: args.phone,
      whatsapp: args.whatsapp,
      instagram: args.instagram,
      website: args.website,
      photoKeys: [],
      status: "pending",
      submittedBy: user._id,
      ratingAvg: 0,
      ratingCount: 0,
      searchText: computeSearchText(args.nameAr, args.nameEn, tax),
      createdAt: now,
      updatedAt: now,
    });

    await syncJoinRows(
      ctx,
      restaurantId,
      tax.categories.map((c) => c._id),
      tax.cuisines.map((c) => c._id),
    );

    // If the submitter says they own it, file a pending ownership claim so it
    // still passes through verification (no auto-grant).
    if (args.claimOwnership) {
      await ctx.db.insert("businessClaims", {
        restaurantId,
        userId: user._id,
        status: "pending",
        note: "طلب ملكية عند إضافة المطعم",
        createdAt: now,
      });
    }

    return { id: restaurantId, slug, claimFiled: args.claimOwnership === true };
  },
});

/** Restaurants the viewer submitted, with status + any rejection reason. */
export const listMine = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return { page: [], isDone: true, continueCursor: "" };

    const results = await ctx.db
      .query("restaurants")
      .withIndex("by_submittedBy", (q) => q.eq("submittedBy", viewer._id))
      .order("desc")
      .paginate(paginationOpts);

    const page = await Promise.all(
      results.page.map(async (r) => ({
        id: r._id,
        slug: r.slug,
        nameAr: r.nameAr,
        cityNameAr: r.cityNameAr,
        status: r.status,
        moderationNote: r.moderationNote ?? null,
        createdAt: r.createdAt,
        coverUrl: await resolveImageUrl(r.coverKey),
      })),
    );
    return { ...results, page };
  },
});

/** Editable view of the viewer's own submission (for the resubmit form). */
export const getMineForEdit = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;
    const r = await ctx.db.get(restaurantId);
    if (!r || r.submittedBy !== viewer._id) return null;

    const [city, neighborhood, categories, cuisines, coverUrl, photoUrls] =
      await Promise.all([
        ctx.db.get(r.cityId),
        r.neighborhoodId ? ctx.db.get(r.neighborhoodId) : Promise.resolve(null),
        Promise.all(r.categoryIds.map((id) => ctx.db.get(id))),
        Promise.all(r.cuisineIds.map((id) => ctx.db.get(id))),
        resolveImageUrl(r.coverKey),
        resolveImageUrls(r.photoKeys),
      ]);

    return {
      id: r._id,
      status: r.status,
      moderationNote: r.moderationNote ?? null,
      coverKey: r.coverKey ?? null,
      photoKeys: r.photoKeys,
      coverUrl,
      photoUrls,
      nameAr: r.nameAr,
      nameEn: r.nameEn ?? null,
      descriptionAr: r.descriptionAr ?? null,
      priceTier: r.priceTier,
      phone: r.phone ?? null,
      whatsapp: r.whatsapp ?? null,
      instagram: r.instagram ?? null,
      website: r.website ?? null,
      address: r.address ?? null,
      citySlug: city?.slug ?? null,
      neighborhoodSlug: neighborhood?.slug ?? null,
      categorySlugs: categories
        .filter((c): c is Doc<"categories"> => c !== null)
        .map((c) => c.slug),
      cuisineSlugs: cuisines
        .filter((c): c is Doc<"cuisines"> => c !== null)
        .map((c) => c.slug),
    };
  },
});

/** Edit a rejected/pending submission and send it back for review. */
export const resubmit = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    nameAr: v.string(),
    nameEn: v.optional(v.string()),
    citySlug: v.string(),
    neighborhoodSlug: v.optional(v.string()),
    categorySlugs: v.array(v.string()),
    cuisineSlugs: v.array(v.string()),
    priceTier,
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    instagram: v.optional(v.string()),
    website: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireViewer(ctx);
    const r = await ctx.db.get(args.restaurantId);
    if (!r) return appError("not_found");
    if (r.submittedBy !== user._id) return appError("forbidden");
    if (r.status !== "rejected" && r.status !== "pending") {
      return appError("invalid_input", "not resubmittable");
    }

    const tax = await resolveTaxonomy(ctx, {
      citySlug: args.citySlug,
      neighborhoodSlug: args.neighborhoodSlug,
      categorySlugs: args.categorySlugs,
      cuisineSlugs: args.cuisineSlugs,
    });
    if (!tax) return appError("invalid_input", "unknown city");

    await ctx.db.patch(args.restaurantId, {
      nameAr: args.nameAr,
      nameEn: args.nameEn,
      descriptionAr: args.descriptionAr,
      cityId: tax.city._id,
      neighborhoodId: tax.neighborhood?._id,
      cityNameAr: tax.city.nameAr,
      neighborhoodNameAr: tax.neighborhood?.nameAr,
      address: args.address,
      categoryIds: tax.categories.map((c) => c._id),
      cuisineIds: tax.cuisines.map((c) => c._id),
      priceTier: args.priceTier,
      phone: args.phone,
      whatsapp: args.whatsapp,
      instagram: args.instagram,
      website: args.website,
      status: "pending",
      moderationNote: undefined,
      searchText: computeSearchText(args.nameAr, args.nameEn, tax),
      updatedAt: Date.now(),
    });

    await syncJoinRows(
      ctx,
      args.restaurantId,
      tax.categories.map((c) => c._id),
      tax.cuisines.map((c) => c._id),
    );
    return { ok: true };
  },
});

/**
 * Allow the submitter (of a pending/rejected restaurant), its owner, or an
 * admin to edit its photos. Returns the restaurant when permitted.
 */
async function requirePhotoEditor(
  ctx: MutationCtx,
  restaurantId: Id<"restaurants">,
): Promise<Doc<"restaurants">> {
  const user = await requireViewer(ctx);
  const restaurant = await ctx.db.get(restaurantId);
  if (!restaurant) return appError("not_found");
  const isAdmin = user.role === "admin";
  const isOwner = restaurant.ownerId === user._id;
  const isSubmitter =
    restaurant.submittedBy === user._id &&
    (restaurant.status === "pending" || restaurant.status === "rejected");
  if (!isAdmin && !isOwner && !isSubmitter) return appError("forbidden");
  return restaurant;
}

/** Presign an upload URL for a restaurant photo during submission. */
export const generateUploadUrl = mutation({
  args: { restaurantId: v.id("restaurants"), key: v.string() },
  handler: async (ctx, { restaurantId, key }) => {
    await requirePhotoEditor(ctx, restaurantId);
    if (!key.startsWith(`restaurants/${restaurantId}/`)) {
      return appError("invalid_input", "key must be scoped to the restaurant");
    }
    return r2.generateUploadUrl(key);
  },
});

/** Set a submitted restaurant's cover + gallery keys (deletes removed from R2). */
export const attachPhotos = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    coverKey: v.optional(v.string()),
    photoKeys: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { restaurantId, coverKey, photoKeys }) => {
    const restaurant = await requirePhotoEditor(ctx, restaurantId);

    const oldKeys = [restaurant.coverKey, ...restaurant.photoKeys].filter(
      (k): k is string => Boolean(k),
    );
    const newKeys = [coverKey, ...(photoKeys ?? [])].filter(
      (k): k is string => Boolean(k),
    );
    const removed = oldKeys.filter((k) => !newKeys.includes(k));
    await Promise.all(removed.map((key) => r2.deleteObject(ctx, key)));

    await ctx.db.patch(restaurantId, {
      coverKey,
      photoKeys: photoKeys ?? [],
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});
