# وين ناكل — Setup

Monorepo: **pnpm workspaces + Turborepo**.

```
apps/web        Next.js 16 website (Arabic-first, RTL)
apps/mobile     Expo app (added in a later phase)
packages/backend  Convex — shared schema, auth, R2, functions
packages/shared   Platform-agnostic TS: arabic search, constants, i18n, domain enums
packages/config   Tailwind v4 token preset + shared eslint/tsconfig
```

## Prerequisites
- Node >= 20.9, pnpm >= 9
- A Convex account (free) and a Cloudflare R2 bucket

## 1. Install
```bash
pnpm install
```

## 2. Provision the Convex backend (one-time, interactive)
```bash
cd packages/backend
npx convex dev        # logs in via browser, creates a dev deployment,
                      # generates convex/_generated, and keeps syncing
```
Leave this running (or re-run any time). It writes `packages/backend/.env.local`
with `CONVEX_DEPLOYMENT` and prints your deployment URLs.

## 3. Configure deployment env vars
```bash
# from packages/backend, with the deployment selected
npx convex env set SITE_URL http://localhost:3000
npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"

# Cloudflare R2 (from an R2 API token)
npx convex env set R2_TOKEN xxxxx
npx convex env set R2_ACCESS_KEY_ID xxxxx
npx convex env set R2_SECRET_ACCESS_KEY xxxxx
npx convex env set R2_ENDPOINT https://<account>.r2.cloudflarestorage.com
npx convex env set R2_BUCKET ween-nakol
```
Add a CORS policy on the R2 bucket allowing `GET` + `PUT` and the `Content-Type`
header from `http://localhost:3000` (and your production origin) — needed once
image uploads land.

## 4. Seed taxonomy (cities, neighborhoods, categories, cuisines)
```bash
# from packages/backend
npx convex run seed:seedTaxonomy
```

## 5. Point the web app at the deployment
```bash
cp apps/web/.env.example apps/web/.env.local
# fill NEXT_PUBLIC_CONVEX_URL / NEXT_PUBLIC_CONVEX_SITE_URL from step 2
```

## 6. Run
```bash
# terminal A (from packages/backend): keep convex dev running
# terminal B:
pnpm --filter @repo/web dev
```
Open http://localhost:3000 — you should see the seeded cities load live and be
able to create an account / sign in (email + password).

## Handy scripts (workspace root)
```bash
pnpm dev             # turbo: runs dev across apps
pnpm build           # turbo: build (depends on convex codegen)
pnpm typecheck       # turbo: typecheck all packages
pnpm lint            # turbo: lint all packages

# Convex — separate dev vs deploy
pnpm convex:dev      # start the DEV deployment (codegen + live sync)
pnpm convex:deploy   # deploy functions to PRODUCTION
pnpm seed            # run seed:seedTaxonomy on the current deployment
```

Equivalent standalone scripts (cross-platform), args pass through:
```bash
scripts/convex-dev.sh          scripts\convex-dev.ps1        # dev
scripts/convex-deploy.sh       scripts\convex-deploy.ps1     # deploy (prod)
```
For CI/non-interactive deploys, set `CONVEX_DEPLOY_KEY` (from the Convex
dashboard → Deploy Keys). To deploy the web app to Vercel against production,
use Convex's build command:
`npx convex deploy --cmd "pnpm --filter @repo/web build" --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`

## Notes
- `convex/_generated` is created by `convex dev`/`codegen`; the web app and its
  types depend on it, so run step 2 before `pnpm build`/`typecheck`.
- Auth is **email + password** only (Google/Apple can be added later). SMS/phone
  auth is intentionally not used — unreliable to Syrian numbers under sanctions.
- Cost discipline: every Convex query is indexed, bounded/paginated, and returns
  a projected view-model. See the plan and project memory before adding queries.
