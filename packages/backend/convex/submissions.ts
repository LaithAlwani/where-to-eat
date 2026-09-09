import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { slugify } from "@repo/shared/slug";
import { requireViewer } from "./lib/viewer";
import { appError } from "./lib/errors";
import {
  resolveTaxonomy,
  computeSearchText,
  syncJoinRows,
} from "./lib/restaurantWrite";

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
