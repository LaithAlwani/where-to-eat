# Project Conventions (وين ناكل)

Standing rules for this codebase. Follow them in every change (web + backend).

## Arabic-first & RTL
- Arabic is the default language; English is secondary. All user-facing copy is Arabic.
- The web root is `<html lang="ar" dir="rtl">`. Use **only logical Tailwind utilities** so layout mirrors: `ms/me`, `ps/pe`, `start/end`, `text-start/text-end`, `border-s/e`. Never `ml/mr/pl/pr/left/right/text-left/text-right`.
- Fonts: **Tajawal** for headings, **IBM Plex Sans Arabic** for body.

## Convex cost & performance (HARD REQUIREMENT)
Convex bills by documents read. Every query/mutation and client fetch must:
- Go through a declared `.withIndex(...)` — no unindexed `.filter()`, no unbounded `.collect()` over growing tables. A single query must never approach ~1000 doc reads (a few hundred is an alarm).
- **Paginate** list-shaped data (cursor `paginate()` / `usePaginatedQuery`), small page sizes (12–24).
- **Project** to a view-model — return only the fields the UI renders; heavy fields (descriptions, menus, photo arrays, hours, contact) load only on the profile.
- **Denormalize** aggregates (`ratingAvg`/`ratingCount`/`ratingBuckets`) and card labels (`cityNameAr`) so reads never scan reviews or do N+1 taxonomy lookups.
- Search hits the `searchIndex` (with filterFields), never post-filters a big set in JS.
- Store R2 **object keys**; resolve display URLs at read time.

## Error handling & UI feedback (HARD REQUIREMENT)
- **No native popups** — never `alert()`, `confirm()`, `prompt()`. Use the shared `Dialog`/`ConfirmDialog` and the toast system (`useToast()`).
- First-class loading / empty / error states on every fetch and mutation. No silent failures.
- Convex functions throw typed `ConvexError` with a stable `code`; clients map codes to Arabic via `@repo/shared/i18n` (`getErrorMessage` in `apps/web/lib/errors.ts`). Never surface raw stack traces.

## Scrollbars (HARD REQUIREMENT)
- No default/native scrollbars. Horizontal scrollers use the `ScrollRail` component (desktop arrow buttons, hidden native bar, RTL-aware). Vertical scroll containers use the `.themed-scroll` utility (thin, brand-tinted). `.no-scrollbar` fully hides.

## General
- No outdated packages/APIs. Respect Next.js 16 conventions (async `params`/`searchParams`, Turbopack default, `proxy.ts` not middleware, `images.remotePatterns`). Read `node_modules/next/dist/docs/` before writing Next code.
- Reusable components; keep files small and focused; descriptive names.
- Auth is email/password only (no SMS — unreliable to Syrian numbers under sanctions); `phone` is display-only.
