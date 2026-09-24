"use client";

import { useRouter } from "next/navigation";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "./ui/ToastProvider";

type NotificationItem = {
  id: Id<"notifications">;
  type:
    | "submission_published"
    | "submission_rejected"
    | "claim_approved"
    | "claim_rejected";
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: number;
};

/**
 * The notifications list shown inside the header bell dialog. Paginated newest
 * first, with per-item mark-read + navigation and a "mark all read" action.
 * First-class loading, empty, and error states.
 */
export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const router = useRouter();
  const dismiss = useMutation(api.notifications.dismiss);
  const dismissAll = useMutation(api.notifications.dismissAll);

  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.listMine,
    {},
    { initialNumItems: 15 },
  );

  // Clicking a notification navigates (if it has a link) and dismisses it, so
  // it leaves the menu. Navigate first, then dismiss so a failed delete never
  // blocks the user reaching the linked page.
  async function handleClick(item: NotificationItem) {
    if (item.link) {
      router.push(item.link);
      onClose();
    }
    try {
      await dismiss({ notificationId: item.id });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    }
  }

  async function handleDismissAll() {
    try {
      await dismissAll({});
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    }
  }

  if (status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-card bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card bg-surface-muted px-6 py-12 text-center">
        <span aria-hidden className="text-3xl">
          🔔
        </span>
        <p className="text-ink-muted">لا توجد إشعارات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDismissAll}
          className="inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink"
        >
          <span aria-hidden className="ms text-[1.125rem]">
            done_all
          </span>
          مسح الكل
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {results.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleClick(item)}
              className="flex w-full flex-col gap-1 rounded-card bg-brand-500/10 p-3 text-start ring-1 ring-ink/5 transition hover:bg-surface-muted"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full bg-brand-500"
                />
                <span className="font-bold text-ink">{item.title}</span>
              </span>
              {item.body && (
                <span className="text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </span>
              )}
              <span className="text-xs text-ink-muted">
                {formatDate(item.createdAt)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {(status === "CanLoadMore" || status === "LoadingMore") && (
        <button
          type="button"
          onClick={() => loadMore(15)}
          disabled={status === "LoadingMore"}
          className="mx-auto rounded-pill bg-surface px-6 py-2 font-medium text-ink ring-1 ring-ink/10 transition hover:bg-surface-muted disabled:opacity-50"
        >
          {status === "LoadingMore" ? "جارٍ التحميل…" : "تحميل المزيد"}
        </button>
      )}
    </div>
  );
}
