import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { buildSearchText } from "@repo/shared/arabic";

export interface ResolvedTaxonomy {
  city: Doc<"cities">;
  neighborhood: Doc<"neighborhoods"> | null;
  categories: Doc<"categories">[];
  cuisines: Doc<"cuisines">[];
}

/** Resolve a submission/edit's city, neighborhood, categories, cuisines by slug. */
export async function resolveTaxonomy(
  ctx: MutationCtx,
  input: {
    citySlug: string;
    neighborhoodSlug?: string;
    categorySlugs: string[];
    cuisineSlugs: string[];
  },
): Promise<ResolvedTaxonomy | null> {
  const city = await ctx.db
    .query("cities")
    .withIndex("by_slug", (q) => q.eq("slug", input.citySlug))
    .unique();
  if (!city) return null;

  let neighborhood: Doc<"neighborhoods"> | null = null;
  if (input.neighborhoodSlug) {
    neighborhood =
      (
        await ctx.db
          .query("neighborhoods")
          .withIndex("by_city", (q) => q.eq("cityId", city._id))
          .collect()
      ).find((n) => n.slug === input.neighborhoodSlug) ?? null;
  }

  const categories = (
    await Promise.all(
      input.categorySlugs.map((slug) =>
        ctx.db
          .query("categories")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique(),
      ),
    )
  ).filter((d): d is Doc<"categories"> => d !== null);

  const cuisines = (
    await Promise.all(
      input.cuisineSlugs.map((slug) =>
        ctx.db
          .query("cuisines")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique(),
      ),
    )
  ).filter((d): d is Doc<"cuisines"> => d !== null);

  return { city, neighborhood, categories, cuisines };
}

/** Build the normalized Ar+En search blob from a restaurant's names + taxonomy. */
export function computeSearchText(
  nameAr: string,
  nameEn: string | undefined,
  tax: ResolvedTaxonomy,
): string {
  return buildSearchText([
    nameAr,
    nameEn,
    tax.city.nameAr,
    tax.city.nameEn,
    tax.neighborhood?.nameAr,
    ...tax.categories.flatMap((c) => [c.nameAr, c.nameEn]),
    ...tax.cuisines.flatMap((c) => [c.nameAr, c.nameEn]),
  ]);
}

/** Replace a restaurant's category/cuisine join rows (bounded delete + insert). */
export async function syncJoinRows(
  ctx: MutationCtx,
  restaurantId: Id<"restaurants">,
  categoryIds: Id<"categories">[],
  cuisineIds: Id<"cuisines">[],
): Promise<void> {
  const [existingCats, existingCuis] = await Promise.all([
    ctx.db
      .query("restaurantCategories")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect(),
    ctx.db
      .query("restaurantCuisines")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect(),
  ]);
  await Promise.all([
    ...existingCats.map((r) => ctx.db.delete(r._id)),
    ...existingCuis.map((r) => ctx.db.delete(r._id)),
  ]);
  await Promise.all([
    ...categoryIds.map((categoryId) =>
      ctx.db.insert("restaurantCategories", { restaurantId, categoryId }),
    ),
    ...cuisineIds.map((cuisineId) =>
      ctx.db.insert("restaurantCuisines", { restaurantId, cuisineId }),
    ),
  ]);
}
