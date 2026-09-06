import { internalMutation } from "./_generated/server";
import {
  CATEGORY_SEEDS,
  CITY_SEEDS,
  CUISINE_SEEDS,
} from "@repo/shared/constants";

/**
 * Idempotent taxonomy seed. Run once after `convex dev` is provisioned:
 *   npx convex run seed:seedTaxonomy
 * Safe to re-run — existing rows (matched by slug) are skipped.
 */
export const seedTaxonomy = internalMutation({
  args: {},
  handler: async (ctx) => {
    let citiesAdded = 0;
    let neighborhoodsAdded = 0;
    let categoriesAdded = 0;
    let cuisinesAdded = 0;

    for (const city of CITY_SEEDS) {
      let cityDoc = await ctx.db
        .query("cities")
        .withIndex("by_slug", (q) => q.eq("slug", city.slug))
        .unique();

      if (!cityDoc) {
        const cityId = await ctx.db.insert("cities", {
          nameAr: city.nameAr,
          nameEn: city.nameEn,
          slug: city.slug,
          isActive: true,
        });
        cityDoc = await ctx.db.get(cityId);
        citiesAdded++;
      }

      const existing = await ctx.db
        .query("neighborhoods")
        .withIndex("by_city", (q) => q.eq("cityId", cityDoc!._id))
        .collect();
      const existingSlugs = new Set(existing.map((n) => n.slug));

      for (const n of city.neighborhoods) {
        if (existingSlugs.has(n.slug)) continue;
        await ctx.db.insert("neighborhoods", {
          cityId: cityDoc!._id,
          nameAr: n.nameAr,
          nameEn: n.nameEn,
          slug: n.slug,
        });
        neighborhoodsAdded++;
      }
    }

    for (const category of CATEGORY_SEEDS) {
      const found = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .unique();
      if (found) continue;
      await ctx.db.insert("categories", category);
      categoriesAdded++;
    }

    for (const cuisine of CUISINE_SEEDS) {
      const found = await ctx.db
        .query("cuisines")
        .withIndex("by_slug", (q) => q.eq("slug", cuisine.slug))
        .unique();
      if (found) continue;
      await ctx.db.insert("cuisines", cuisine);
      cuisinesAdded++;
    }

    return { citiesAdded, neighborhoodsAdded, categoriesAdded, cuisinesAdded };
  },
});
