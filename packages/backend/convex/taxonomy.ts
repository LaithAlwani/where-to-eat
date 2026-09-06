import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Taxonomy read APIs. These tables are small, fixed-size reference data, but we
 * still bound reads with `.take()` and project to a view-model (only fields the
 * UI renders) to keep payloads and document reads minimal.
 */

const TAXONOMY_LIMIT = 200;

export const listCities = query({
  args: {},
  handler: async (ctx) => {
    const cities = await ctx.db
      .query("cities")
      .withIndex("by_slug")
      .take(TAXONOMY_LIMIT);
    return cities
      .filter((c) => c.isActive)
      .map((c) => ({
        id: c._id,
        slug: c.slug,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
      }));
  },
});

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_slug")
      .take(TAXONOMY_LIMIT);
    return categories.map((c) => ({
      id: c._id,
      slug: c.slug,
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      icon: c.icon,
    }));
  },
});

export const listCuisines = query({
  args: {},
  handler: async (ctx) => {
    const cuisines = await ctx.db
      .query("cuisines")
      .withIndex("by_slug")
      .take(TAXONOMY_LIMIT);
    return cuisines.map((c) => ({
      id: c._id,
      slug: c.slug,
      nameAr: c.nameAr,
      nameEn: c.nameEn,
    }));
  },
});

export const listNeighborhoods = query({
  args: { cityId: v.id("cities") },
  handler: async (ctx, { cityId }) => {
    const neighborhoods = await ctx.db
      .query("neighborhoods")
      .withIndex("by_city", (q) => q.eq("cityId", cityId))
      .take(TAXONOMY_LIMIT);
    return neighborhoods.map((n) => ({
      id: n._id,
      slug: n.slug,
      nameAr: n.nameAr,
      nameEn: n.nameEn,
    }));
  },
});
