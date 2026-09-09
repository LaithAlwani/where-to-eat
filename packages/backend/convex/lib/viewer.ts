import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { appError } from "./errors";

/** The signed-in domain user, or null if unauthenticated / no profile row yet. */
export async function getViewer(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
    .unique();
}

/** Require a signed-in, non-banned user; throws a typed AppError otherwise. */
export async function requireViewer(ctx: QueryCtx): Promise<Doc<"users">> {
  const user = await getViewer(ctx);
  if (!user) return appError("unauthenticated");
  if (user.isBanned) return appError("forbidden");
  return user;
}

/** Require the viewer to be an admin. */
export async function requireAdmin(ctx: QueryCtx): Promise<Doc<"users">> {
  const user = await requireViewer(ctx);
  if (user.role !== "admin") return appError("forbidden");
  return user;
}
