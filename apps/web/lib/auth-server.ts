import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
// The Convex site URL is the cloud URL with `.convex.cloud` → `.convex.site`.
// Derive it so deployments only need NEXT_PUBLIC_CONVEX_URL (which
// `convex deploy --cmd` injects); NEXT_PUBLIC_CONVEX_SITE_URL is optional.
const convexSiteUrl =
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
  convexUrl.replace(/\.convex\.cloud$/, ".convex.site");

/**
 * Server-side Better Auth helpers for the Next.js App Router: the `/api/auth`
 * route handler, `getToken()` for seeding the client provider during SSR, and
 * `preloadAuthQuery`/`fetchAuthQuery` for authenticated server reads.
 */
export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl,
  convexSiteUrl,
});
