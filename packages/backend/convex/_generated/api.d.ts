/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as claims from "../claims.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as lib_cards from "../lib/cards.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_ownership from "../lib/ownership.js";
import type * as lib_ratings from "../lib/ratings.js";
import type * as lib_restaurantWrite from "../lib/restaurantWrite.js";
import type * as lib_viewer from "../lib/viewer.js";
import type * as owner from "../owner.js";
import type * as r2 from "../r2.js";
import type * as reports from "../reports.js";
import type * as restaurants from "../restaurants.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as submissions from "../submissions.js";
import type * as taxonomy from "../taxonomy.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  claims: typeof claims;
  favorites: typeof favorites;
  http: typeof http;
  "lib/cards": typeof lib_cards;
  "lib/errors": typeof lib_errors;
  "lib/ownership": typeof lib_ownership;
  "lib/ratings": typeof lib_ratings;
  "lib/restaurantWrite": typeof lib_restaurantWrite;
  "lib/viewer": typeof lib_viewer;
  owner: typeof owner;
  r2: typeof r2;
  reports: typeof reports;
  restaurants: typeof restaurants;
  reviews: typeof reviews;
  seed: typeof seed;
  submissions: typeof submissions;
  taxonomy: typeof taxonomy;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
};
