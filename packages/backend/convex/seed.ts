import { internalMutation } from "./_generated/server";
import {
  CATEGORY_SEEDS,
  CITY_SEEDS,
  CUISINE_SEEDS,
} from "@repo/shared/constants";
import { RESTAURANT_SEEDS } from "@repo/shared/restaurant-seeds";
import { buildSearchText } from "@repo/shared/arabic";
import type { Id, Doc } from "./_generated/dataModel";

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

/**
 * Seed sample restaurants (+ menus + category/cuisine join rows). Idempotent by
 * restaurant slug. Requires seedTaxonomy to have run first.
 *   npx convex run seed:seedRestaurants
 */
export const seedRestaurants = internalMutation({
  args: {},
  handler: async (ctx) => {
    let restaurantsAdded = 0;

    for (const seed of RESTAURANT_SEEDS) {
      const existing = await ctx.db
        .query("restaurants")
        .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
        .unique();
      if (existing) continue;

      const city = await ctx.db
        .query("cities")
        .withIndex("by_slug", (q) => q.eq("slug", seed.citySlug))
        .unique();
      if (!city) continue;

      let neighborhoodId: Id<"neighborhoods"> | undefined;
      let neighborhoodNameAr: string | undefined;
      if (seed.neighborhoodSlug) {
        const neighborhood = (
          await ctx.db
            .query("neighborhoods")
            .withIndex("by_city", (q) => q.eq("cityId", city._id))
            .collect()
        ).find((n) => n.slug === seed.neighborhoodSlug);
        neighborhoodId = neighborhood?._id;
        neighborhoodNameAr = neighborhood?.nameAr;
      }

      const categories = (
        await Promise.all(
          seed.categorySlugs.map((slug) =>
            ctx.db
              .query("categories")
              .withIndex("by_slug", (q) => q.eq("slug", slug))
              .unique(),
          ),
        )
      ).filter((d): d is Doc<"categories"> => d !== null);
      const cuisines = (
        await Promise.all(
          seed.cuisineSlugs.map((slug) =>
            ctx.db
              .query("cuisines")
              .withIndex("by_slug", (q) => q.eq("slug", slug))
              .unique(),
          ),
        )
      ).filter((d): d is Doc<"cuisines"> => d !== null);

      const searchText = buildSearchText([
        seed.nameAr,
        seed.nameEn,
        city.nameAr,
        city.nameEn,
        neighborhoodNameAr,
        ...categories.flatMap((c) => [c.nameAr, c.nameEn]),
        ...cuisines.flatMap((c) => [c.nameAr, c.nameEn]),
      ]);

      const now = Date.now();
      const restaurantId = await ctx.db.insert("restaurants", {
        nameAr: seed.nameAr,
        nameEn: seed.nameEn,
        slug: seed.slug,
        descriptionAr: seed.descriptionAr,
        cityId: city._id,
        neighborhoodId,
        cityNameAr: city.nameAr,
        neighborhoodNameAr,
        categoryIds: categories.map((c) => c._id),
        cuisineIds: cuisines.map((c) => c._id),
        priceTier: seed.priceTier,
        phone: seed.phone,
        instagram: seed.instagram,
        photoKeys: [],
        status: "published",
        ratingAvg: seed.ratingAvg,
        ratingCount: seed.ratingCount,
        searchText,
        createdAt: now,
        updatedAt: now,
      });

      for (const category of categories) {
        await ctx.db.insert("restaurantCategories", {
          restaurantId,
          categoryId: category._id,
        });
      }
      for (const cuisine of cuisines) {
        await ctx.db.insert("restaurantCuisines", {
          restaurantId,
          cuisineId: cuisine._id,
        });
      }

      if (seed.menu) {
        await ctx.db.insert("menus", {
          restaurantId,
          sections: seed.menu,
          updatedAt: now,
        });
      }

      restaurantsAdded++;
    }

    return { restaurantsAdded };
  },
});
