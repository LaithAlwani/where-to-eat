import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export type NotificationType =
  | "submission_published"
  | "submission_rejected"
  | "claim_approved"
  | "claim_rejected";

/** Create an in-app notification for a user. */
export async function notify(
  ctx: MutationCtx,
  userId: Id<"users">,
  n: { type: NotificationType; title: string; body?: string; link?: string },
): Promise<void> {
  await ctx.db.insert("notifications", {
    userId,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read: false,
    createdAt: Date.now(),
  });
}
