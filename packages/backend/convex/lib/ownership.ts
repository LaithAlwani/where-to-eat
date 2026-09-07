import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireViewer } from "./viewer";
import { appError } from "./errors";

/**
 * Require the viewer to own `restaurantId` (or be an admin). Returns the user
 * and restaurant docs. Throws a typed AppError otherwise.
 */
export async function requireRestaurantOwner(
  ctx: MutationCtx,
  restaurantId: Id<"restaurants">,
): Promise<{ user: Doc<"users">; restaurant: Doc<"restaurants"> }> {
  const user = await requireViewer(ctx);
  const restaurant = await ctx.db.get(restaurantId);
  if (!restaurant) return appError("not_found");

  const isOwner = restaurant.ownerId === user._id;
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) return appError("forbidden");

  return { user, restaurant };
}
