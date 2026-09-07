import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { REPORT_REASONS, REPORT_TARGET_TYPES } from "@repo/shared/domain";
import { requireViewer } from "./lib/viewer";

const reasonValidator = v.union(
  ...REPORT_REASONS.map((r) => v.literal(r)),
);
const targetTypeValidator = v.union(
  ...REPORT_TARGET_TYPES.map((t) => v.literal(t)),
);

/**
 * File a report against a review or restaurant. Deduped: one open report per
 * user per target (prevents spam). Moderation happens in the admin dashboard.
 */
export const create = mutation({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
    reason: reasonValidator,
    note: v.optional(v.string()),
  },
  handler: async (ctx, { targetType, targetId, reason, note }) => {
    const user = await requireViewer(ctx);

    const existing = await ctx.db
      .query("reports")
      .withIndex("by_target", (q) =>
        q.eq("targetType", targetType).eq("targetId", targetId),
      )
      .collect();
    const alreadyOpen = existing.some(
      (r) => r.reporterId === user._id && r.status === "open",
    );
    if (alreadyOpen) return { ok: true, duplicate: true };

    await ctx.db.insert("reports", {
      targetType,
      targetId,
      reporterId: user._id,
      reason,
      note,
      status: "open",
      createdAt: Date.now(),
    });
    return { ok: true, duplicate: false };
  },
});
