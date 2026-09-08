# وين ناكل (Ween Nakol) — Roadmap & Status

Arabic-first, mobile-first restaurant & café discovery platform for Syria.
Monorepo: **pnpm + Turborepo**. See [SETUP.md](../SETUP.md) to run it.

## Stack
- **Web:** Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 (CSS-first) — `apps/web`
- **Mobile (later):** Expo + Expo Router + NativeWind v4 — `apps/mobile` (not started)
- **Backend:** Convex (shared) — `packages/backend` (deployment: `cautious-parrot-717`)
- **Auth:** Better Auth via `@convex-dev/better-auth` (email/password; no SMS)
- **Images:** Cloudflare R2 via `@convex-dev/r2`
- **Shared:** `packages/shared` (arabic normalize, slugify, constants, i18n, domain), `packages/config` (Tailwind tokens, eslint, tsconfig)

## Status
- ✅ **Phase 0 — Monorepo foundation** (pnpm workspaces, Turborepo, packages/config)
- ✅ **Phase 1 — Shared backend** (schema, Better Auth, R2 wiring, taxonomy seed)
- ✅ **Phase 2 — Web read path** (discovery homepage, search, filters, restaurant profiles, 11 seeded restaurants)
- ✅ **Phase 3 — Reviews, ratings, photos, favorites** (one-per-user reviews + transactional aggregates, R2 photo upload, favorites, reports; custom scrollbars)
- ✅ **Phase 4 — Submission, claiming, business dashboard** (submit `pending`, claim flow + internal approve bridge, owner dashboard: info/hours/photos/menu/review-replies)
- ⬜ **Phase 5 — Admin dashboard** (moderate submissions/claims/reviews/reports, manage taxonomies, ban users, publish/reject) — replaces the CLI approve/publish bridge
- ⬜ **Phase 6 — Mobile app** (Expo)

## Interim admin bridge (until Phase 5)
- Approve a claim → grant ownership: `cd packages/backend && npx convex run claims:approve '{"claimId":"<id>"}'`
- Publish a pending submission: set its `status` to `published` in the Convex dashboard → Data → restaurants
- Seed taxonomy / restaurants: `npx convex run seed:seedTaxonomy` / `seed:seedRestaurants`

## Outstanding config (account-side)
- **R2 bucket** not yet provisioned → photo uploads fail until the 5 `R2_*` env vars + bucket CORS are set (see SETUP.md "Cloudflare R2"). Deployment env vars (auth secret, R2) live on the Convex deployment, so they persist across machines.
- For `next/image` covers, add the R2 host (or `R2_PUBLIC_HOST`) to `apps/web/next.config.ts` once R2 is live.

## Working from another machine
1. `git clone` + `pnpm install`
2. `cd packages/backend && npx convex dev` (log in with the same Convex account → links your dev deployment; data + deployment env vars are already in the cloud)
3. `cp apps/web/.env.example apps/web/.env.local` and fill the `NEXT_PUBLIC_CONVEX_*` URLs (printed by `convex dev`)
4. `pnpm convex:dev` (terminal 1) + `pnpm dev` (terminal 2) → http://localhost:3000
