import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

/**
 * Origins allowed to call the auth API. Defaults to SITE_URL plus its common
 * localhost/127.0.0.1 twin (so dev doesn't 403 with "invalid origin" when the
 * browser uses a different host than SITE_URL). Set TRUSTED_ORIGINS (comma-
 * separated) to add production origins.
 */
function trustedOrigins(): string[] {
  const extra = (process.env.TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const set = new Set([siteUrl, ...extra]);
  if (siteUrl?.includes("localhost")) set.add(siteUrl.replace("localhost", "127.0.0.1"));
  if (siteUrl?.includes("127.0.0.1")) set.add(siteUrl.replace("127.0.0.1", "localhost"));
  return [...set].filter(Boolean);
}

export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Better Auth instance. Email + password is the primary flow (SMS/phone auth
 * is intentionally excluded — unreliable to Syrian numbers). Google/Apple
 * OAuth can be added here later behind env-guarded client ids.
 */
export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    trustedOrigins: trustedOrigins(),
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [convex({ authConfig })],
  });
