import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { appError } from "./lib/errors";

export const r2 = new R2(components.r2);

/**
 * Signed-upload API for restaurant/review/menu images. Uploads are gated on an
 * authenticated user; `onUpload` will link keys to rows in later phases.
 * Clients call generateUploadUrl -> PUT bytes -> syncMetadata. We store only
 * the object KEY and resolve a display URL at read time.
 */
export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) appError("unauthenticated");
  },
  onUpload: async () => {
    // Row linking (restaurant.photoKeys / review.photoKeys) is wired with the
    // upload UIs in later phases.
  },
});
