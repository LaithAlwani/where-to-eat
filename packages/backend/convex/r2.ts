import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { appError } from "./lib/errors";

export const r2 = new R2(components.r2);

/**
 * Public base URL for the R2 bucket (e.g. https://pub-xxxx.r2.dev or a custom
 * domain), set via `npx convex env set R2_PUBLIC_URL ...`. Restaurant/review
 * photos are public, so we serve stable, CDN-cacheable public URLs. Falls back
 * to a short-lived signed URL only if no public base is configured.
 */
function publicBase(): string | null {
  const base = process.env.R2_PUBLIC_URL;
  return base ? base.replace(/\/+$/, "") : null;
}

/** Resolve one R2 object key to a public display URL (null-safe). */
export async function resolveImageUrl(
  key: string | null | undefined,
): Promise<string | null> {
  if (!key) return null;
  const base = publicBase();
  return base ? `${base}/${key}` : await r2.getUrl(key);
}

/** Resolve a list of R2 keys to public display URLs (bounded by caller). */
export async function resolveImageUrls(keys: string[]): Promise<string[]> {
  const base = publicBase();
  if (base) return keys.map((key) => `${base}/${key}`);
  return Promise.all(keys.map((key) => r2.getUrl(key)));
}

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
