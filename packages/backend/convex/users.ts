import { query, mutation } from "./_generated/server";
import { appError } from "./lib/errors";

/**
 * Viewer profile projected to only what the header/nav renders — never the
 * whole document.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();
    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      role: user.role,
      locale: user.locale,
      avatarKey: user.avatarKey ?? null,
    };
  },
});

/**
 * Lazily create the domain profile row for the signed-in Better Auth user.
 * Idempotent; called by the client right after authentication. Defaults to
 * the "user" role — owners/admins are promoted via claims / admin tooling.
 */
export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) appError("unauthenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      authId: identity.subject,
      name: identity.name ?? identity.email ?? "مستخدم",
      email: identity.email ?? "",
      role: "user",
      locale: "ar",
      isBanned: false,
      createdAt: Date.now(),
    });
  },
});
