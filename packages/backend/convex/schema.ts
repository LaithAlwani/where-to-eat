import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * وين ناكل data model.
 *
 * Conventions enforced for cost/perf (see plan): image fields store R2 object
 * KEYS (never blobs); `restaurants` denormalizes card labels + rating
 * aggregates so list/profile reads stay bounded and never scan reviews; every
 * access path used by the app has a matching index.
 */

const priceTier = v.union(
  v.literal(1),
  v.literal(2),
  v.literal(3),
  v.literal(4),
);

const geo = v.object({ lat: v.number(), lng: v.number() });

const openingHours = v.array(
  v.object({
    day: v.number(), // 0=Sunday .. 6=Saturday
    open: v.optional(v.string()), // "09:00"
    close: v.optional(v.string()), // "23:30"
    closed: v.optional(v.boolean()),
  }),
);

const menuSection = v.object({
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
});

export default defineSchema({
  users: defineTable({
    authId: v.string(), // Better Auth subject id
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()), // display only, never used for auth
    avatarKey: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("owner"), v.literal("admin")),
    locale: v.union(v.literal("ar"), v.literal("en")),
    isBanned: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_authId", ["authId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  cities: defineTable({
    nameAr: v.string(),
    nameEn: v.string(),
    slug: v.string(),
    isActive: v.boolean(),
  }).index("by_slug", ["slug"]),

  neighborhoods: defineTable({
    cityId: v.id("cities"),
    nameAr: v.string(),
    nameEn: v.string(),
    slug: v.string(),
  }).index("by_city", ["cityId"]),

  categories: defineTable({
    nameAr: v.string(),
    nameEn: v.string(),
    slug: v.string(),
    icon: v.string(),
  }).index("by_slug", ["slug"]),

  cuisines: defineTable({
    nameAr: v.string(),
    nameEn: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),

  restaurants: defineTable({
    nameAr: v.string(),
    nameEn: v.optional(v.string()),
    slug: v.string(),
    descriptionAr: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),

    cityId: v.id("cities"),
    neighborhoodId: v.optional(v.id("neighborhoods")),
    // Denormalized labels so list cards never read taxonomy per row (no N+1).
    cityNameAr: v.string(),
    neighborhoodNameAr: v.optional(v.string()),
    address: v.optional(v.string()),
    geo: v.optional(geo),

    categoryIds: v.array(v.id("categories")),
    cuisineIds: v.array(v.id("cuisines")),
    priceTier: priceTier,

    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    instagram: v.optional(v.string()),
    website: v.optional(v.string()),
    hours: v.optional(openingHours),

    coverKey: v.optional(v.string()),
    photoKeys: v.array(v.string()),

    status: v.union(
      v.literal("pending"),
      v.literal("published"),
      v.literal("rejected"),
      v.literal("closed"),
    ),
    ownerId: v.optional(v.id("users")),
    submittedBy: v.optional(v.id("users")),

    // Denormalized aggregates — maintained in review mutations, never read-computed.
    ratingAvg: v.number(),
    ratingCount: v.number(),
    // Star distribution [#1★, #2★, #3★, #4★, #5★]; updated with each review.
    ratingBuckets: v.optional(v.array(v.number())),

    // Normalized Ar+En blob for the search index (built with buildSearchText).
    searchText: v.string(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_city", ["cityId"])
    .index("by_status", ["status"])
    .index("by_owner", ["ownerId"])
    // Ordered top-rated within a status without scanning/sorting in JS.
    .index("by_status_rating", ["status", "ratingAvg"])
    .searchIndex("search_text", {
      searchField: "searchText",
      filterFields: ["cityId", "status", "priceTier"],
    }),

  reviews: defineTable({
    restaurantId: v.id("restaurants"),
    userId: v.id("users"),
    // Denormalized author display so a review list never reads users per row.
    authorName: v.string(),
    authorAvatarKey: v.optional(v.string()),
    rating: v.number(), // 1..5, validated in the mutation
    body: v.optional(v.string()),
    photoKeys: v.array(v.string()),
    status: v.union(
      v.literal("visible"),
      v.literal("pending"),
      v.literal("hidden"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    editedAt: v.optional(v.number()),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_user", ["userId"])
    .index("by_user_restaurant", ["userId", "restaurantId"])
    .index("by_restaurant_status", ["restaurantId", "status"]),

  ownerResponses: defineTable({
    reviewId: v.id("reviews"),
    restaurantId: v.id("restaurants"),
    ownerId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_review", ["reviewId"]),

  menus: defineTable({
    restaurantId: v.id("restaurants"),
    sections: v.array(menuSection),
    updatedAt: v.number(),
  }).index("by_restaurant", ["restaurantId"]),

  favorites: defineTable({
    userId: v.id("users"),
    restaurantId: v.id("restaurants"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_restaurant", ["userId", "restaurantId"])
    .index("by_restaurant", ["restaurantId"]),

  businessClaims: defineTable({
    restaurantId: v.id("restaurants"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    evidence: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    note: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    decidedAt: v.optional(v.number()),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  reports: defineTable({
    targetType: v.union(v.literal("review"), v.literal("restaurant")),
    targetId: v.string(),
    reporterId: v.id("users"),
    reason: v.string(),
    note: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("actioned"),
      v.literal("dismissed"),
    ),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_target", ["targetType", "targetId"]),

  // Join tables for category/cuisine discovery rails and filters. Listing a
  // category reads one indexed page of join rows, then batch-gets that page's
  // restaurants — bounded (page size), never a full scan.
  restaurantCategories: defineTable({
    restaurantId: v.id("restaurants"),
    categoryId: v.id("categories"),
  })
    .index("by_category", ["categoryId"])
    .index("by_restaurant", ["restaurantId"]),

  restaurantCuisines: defineTable({
    restaurantId: v.id("restaurants"),
    cuisineId: v.id("cuisines"),
  })
    .index("by_cuisine", ["cuisineId"])
    .index("by_restaurant", ["restaurantId"]),
});
