"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@repo/backend";
import { toEasternArabicDigits } from "@repo/shared/arabic";
import { Dialog } from "./ui/Dialog";
import { NotificationsPanel } from "./NotificationsPanel";

/**
 * Header notifications bell: a 🔔 button with an unread-count badge (capped at
 * "99+"). Opens the paginated NotificationsPanel inside an accessible Dialog.
 */
export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useQuery(api.notifications.unreadCount);
  const count = unreadCount ?? 0;
  const badge = count > 99 ? "٩٩+" : toEasternArabicDigits(String(count));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={count > 0 ? `الإشعارات (${badge} غير مقروءة)` : "الإشعارات"}
        className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-pill border border-line text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span aria-hidden className="ms text-[1.375rem]">
          notifications
        </span>
        {count > 0 && (
          <span
            aria-hidden
            className="absolute -top-1.5 -inset-e-1.5 inline-flex min-w-5 items-center justify-center rounded-pill bg-brand-500 px-1 text-[0.65rem] font-bold leading-tight text-on-accent"
          >
            {badge}
          </span>
        )}
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="الإشعارات">
        <NotificationsPanel onClose={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
