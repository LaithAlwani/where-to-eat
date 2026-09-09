import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { getViewer, requireViewer } from "./lib/viewer";
import { appError } from "./lib/errors";

const UNREAD_CAP = 99;

/** The viewer's notifications, newest first (paginated). */
export const listMine = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return { page: [], isDone: true, continueCursor: "" };

    const results = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", viewer._id))
      .order("desc")
      .paginate(paginationOpts);

    return {
      ...results,
      page: results.page.map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        body: n.body ?? null,
        link: n.link ?? null,
        read: n.read,
        createdAt: n.createdAt,
      })),
    };
  },
});

/** Unread count for the header badge (capped, bounded read). */
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return 0;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", viewer._id).eq("read", false),
      )
      .take(UNREAD_CAP + 1);
    return unread.length;
  },
});

/** Mark one notification read (owner only). */
export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const viewer = await requireViewer(ctx);
    const notification = await ctx.db.get(notificationId);
    if (!notification) return;
    if (notification.userId !== viewer._id) return appError("forbidden");
    if (!notification.read) await ctx.db.patch(notificationId, { read: true });
    return { ok: true };
  },
});

/** Mark all the viewer's notifications read (bounded per call). */
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = await requireViewer(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", viewer._id).eq("read", false),
      )
      .take(200);
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
    return { ok: true, marked: unread.length };
  },
});
