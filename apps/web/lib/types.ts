import type { FunctionReturnType } from "convex/server";
import { api } from "@repo/backend";

/** The list-card view-model returned by every discovery/list query. */
export type RestaurantCard = FunctionReturnType<
  typeof api.restaurants.discoveryTopRated
>[number];

/** The full restaurant profile returned by getBySlug (non-null variant). */
export type RestaurantProfile = NonNullable<
  FunctionReturnType<typeof api.restaurants.getBySlug>
>;

/** A single review row from the paginated listByRestaurant query. */
export type Review = FunctionReturnType<
  typeof api.reviews.listByRestaurant
>["page"][number];
