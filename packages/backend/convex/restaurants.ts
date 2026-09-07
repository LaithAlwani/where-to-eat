import { query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { normalizeArabic } from "@repo/shared/arabic";
import { resolveImageUrl, resolveImageUrls } from "./r2";
import { toCards } from "./lib/cards";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

const RAIL_LIMIT = 12;
const MAX_RAIL_LIMIT = 24;

function clampLimit(limit: number | undefined): number {
  if (!limit || limit < 1) return RAIL_LIMIT;
  return Math.min(limit, MAX_RAIL_LIMIT);
}

/** Newest published restaurants (discovery rail). */
export const discoveryNewest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(clampLimit(limit));
    return toCards(rows);
  },
});

/** Highest-rated published restaurants (discovery rail), ordered by index. */
export const discoveryTopRated = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query("restaurants")
      .withIndex("by_status_rating", (q) => q.eq("status", "published"))
      .order("desc")
      .take(clampLimit(limit));
    return toCards(rows);
  },
});

/** Batch-load a page of restaurants by id, dropping any not-published. */
async function cardsByIds(ctx: QueryCtx, ids: Id<"restaurants">[]) {
  const docs = await Promise.all(ids.map((id) => ctx.db.get(id)));
  const published = docs.filter(
    (d): d is Doc<"restaurants"> => d !== null && d.status === "published",
  );
  return toCards(published);
}

/** Paginated restaurants in a category (by slug). */
export const listByCategory = query({
  args: { categorySlug: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { categorySlug, paginationOpts }) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .unique();
    if (!category) return { page: [], isDone: true, continueCursor: "" };

    const joins = await ctx.db
      .query("restaurantCategories")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .paginate(paginationOpts);

    const page = await cardsByIds(
      ctx,
      joins.page.map((j) => j.restaurantId),
    );
    return { ...joins, page };
  },
});

/** Paginated published restaurants in a city (by slug) — area browsing. */
export const listByCity = query({
  args: { citySlug: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { citySlug, paginationOpts }) => {
    const city = await ctx.db
      .query("cities")
      .withIndex("by_slug", (q) => q.eq("slug", citySlug))
      .unique();
    if (!city) return { page: [], isDone: true, continueCursor: "" };

    const results = await ctx.db
      .query("restaurants")
      .withIndex("by_city", (q) => q.eq("cityId", city._id))
      .paginate(paginationOpts);

    const page = await toCards(
      results.page.filter((r) => r.status === "published"),
    );
    return { ...results, page };
  },
});

/** Paginated restaurants of a cuisine (by slug). */
export const listByCuisine = query({
  args: { cuisineSlug: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { cuisineSlug, paginationOpts }) => {
    const cuisine = await ctx.db
      .query("cuisines")
      .withIndex("by_slug", (q) => q.eq("slug", cuisineSlug))
      .unique();
    if (!cuisine) return { page: [], isDone: true, continueCursor: "" };

    const joins = await ctx.db
      .query("restaurantCuisines")
      .withIndex("by_cuisine", (q) => q.eq("cuisineId", cuisine._id))
      .paginate(paginationOpts);

    const page = await cardsByIds(
      ctx,
      joins.page.map((j) => j.restaurantId),
    );
    return { ...joins, page };
  },
});

/**
 * Arabic-tolerant full-text search over published restaurants. The query is
 * normalized identically to the indexed `searchText`; narrowing (city/price)
 * happens inside the search index via filterFields, and results paginate — no
 * large candidate set is post-filtered in JS.
 */
export const search = query({
  args: {
    q: v.string(),
    cityId: v.optional(v.id("cities")),
    priceTier: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4))),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { q, cityId, priceTier, paginationOpts }) => {
    const normalized = normalizeArabic(q);
    if (normalized.length === 0) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const results = await ctx.db
      .query("restaurants")
      .withSearchIndex("search_text", (s) => {
        let builder = s
          .search("searchText", normalized)
          .eq("status", "published");
        if (cityId) builder = builder.eq("cityId", cityId);
        if (priceTier) builder = builder.eq("priceTier", priceTier);
        return builder;
      })
      .paginate(paginationOpts);

    return { ...results, page: await toCards(results.page) };
  },
});

/**
 * Full restaurant profile by slug: one restaurant doc, its taxonomy labels
 * (bounded batch-get), and its menu. Reviews are loaded separately/paginated
 * (Phase 3) so a profile load never reads all reviews.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const r = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!r || r.status !== "published") return null;

    const [categoryDocs, cuisineDocs, menu, coverUrl, photoUrls] =
      await Promise.all([
        Promise.all(r.categoryIds.map((id) => ctx.db.get(id))),
        Promise.all(r.cuisineIds.map((id) => ctx.db.get(id))),
        ctx.db
          .query("menus")
          .withIndex("by_restaurant", (q) => q.eq("restaurantId", r._id))
          .unique(),
        resolveImageUrl(r.coverKey),
        resolveImageUrls(r.photoKeys),
      ]);

    const labels = <T extends Doc<"categories"> | Doc<"cuisines">>(
      docs: (T | null)[],
    ) =>
      docs
        .filter((d): d is T => d !== null)
        .map((d) => ({ slug: d.slug, nameAr: d.nameAr, nameEn: d.nameEn }));

    return {
      id: r._id,
      slug: r.slug,
      nameAr: r.nameAr,
      nameEn: r.nameEn ?? null,
      descriptionAr: r.descriptionAr ?? null,
      descriptionEn: r.descriptionEn ?? null,
      cityNameAr: r.cityNameAr,
      neighborhoodNameAr: r.neighborhoodNameAr ?? null,
      address: r.address ?? null,
      geo: r.geo ?? null,
      priceTier: r.priceTier,
      phone: r.phone ?? null,
      whatsapp: r.whatsapp ?? null,
      instagram: r.instagram ?? null,
      website: r.website ?? null,
      hours: r.hours ?? null,
      coverUrl,
      photoUrls,
      ratingAvg: r.ratingAvg,
      ratingCount: r.ratingCount,
      ratingBuckets: r.ratingBuckets ?? [0, 0, 0, 0, 0],
      categories: labels(categoryDocs),
      cuisines: labels(cuisineDocs),
      menu: menu ? menu.sections : null,
    };
  },
});
