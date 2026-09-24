import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

/**
 * Origins allowed to call the auth API. Always trusts the common local dev
 * ports (localhost + 127.0.0.1 on 3000/3001/3002) — Next.js hops to 3001/3002
 * when 3000 is busy, which would otherwise 403 with "invalid origin". SITE_URL
 * and TRUSTED_ORIGINS (comma-separated) add production origins.
 */
function trustedOrigins(): string[] {
  const devOrigins = [3000, 3001, 3002].flatMap((port) => [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ]);
  const extra = (process.env.TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([siteUrl, ...devOrigins, ...extra].filter(Boolean))];
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
