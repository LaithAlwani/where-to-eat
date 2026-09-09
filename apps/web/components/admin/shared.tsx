import type { ReactNode } from "react";

/**
 * Shared building blocks for the admin queues so every moderation card, empty
 * state, and action button stays visually consistent. Buttons use only logical
 * spacing utilities to remain RTL-correct.
 */

/** Green accent action (approve / publish). */
export const approveBtnClass =
  "rounded-pill bg-accent-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-50";

/** Destructive / negative action (reject, hide, close). */
export const dangerBtnClass =
  "rounded-pill border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50";

/** Neutral action (dismiss). */
export const neutralBtnClass =
  "rounded-pill border border-ink-muted/30 px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-muted disabled:opacity-50";

/** Card shell shared by every moderation queue item. */
export function AdminCard({ children }: { children: ReactNode }) {
  return (
    <article className="flex flex-col gap-3 rounded-card bg-surface p-4 ring-1 ring-ink/5">
      {children}
    </article>
  );
}

/** Centered empty-state message shown when a queue has no items. */
export function EmptyState({ icon = "✅", message }: { icon?: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card bg-surface-muted px-6 py-12 text-center">
      <span aria-hidden className="text-3xl">
        {icon}
      </span>
      <p className="text-ink-muted">{message}</p>
    </div>
  );
}

/** Skeleton rows shown while a queue's first page loads. */
export function QueueSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-card bg-surface-muted" />
      ))}
    </div>
  );
}

/** "تحميل المزيد" button wired to a usePaginatedQuery status + loadMore. */
export function LoadMoreButton({
  status,
  loadMore,
  pageSize = 20,
}: {
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadMore: (numItems: number) => void;
  pageSize?: number;
}) {
  if (status !== "CanLoadMore" && status !== "LoadingMore") return null;
  return (
    <button
      type="button"
      onClick={() => loadMore(pageSize)}
      disabled={status === "LoadingMore"}
      className="mx-auto rounded-pill bg-surface px-6 py-2 font-medium text-ink ring-1 ring-ink/10 transition hover:bg-surface-muted disabled:opacity-50"
    >
      {status === "LoadingMore" ? "جارٍ التحميل…" : "تحميل المزيد"}
    </button>
  );
}
