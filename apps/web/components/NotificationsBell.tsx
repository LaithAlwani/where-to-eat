"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend";
import { toEasternArabicDigits } from "@repo/shared/arabic";
import { Popover } from "./ui/Popover";
import { NotificationsPanel } from "./NotificationsPanel";

/**
 * Header notifications bell: a 🔔 button with an unread-count badge (capped at
 * "99+"). Opens the paginated NotificationsPanel inside an animated Popover
 * anchored under the bell.
 */
export function NotificationsBell() {
  const unreadCount = useQuery(api.notifications.unreadCount);
  const count = unreadCount ?? 0;
  const badge = count > 99 ? "٩٩+" : toEasternArabicDigits(String(count));

  return (
    <Popover
      label={count > 0 ? `الإشعارات (${badge})` : "الإشعارات"}
      triggerClassName="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-pill border border-line text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      panelClassName="w-80 sm:w-96"
      trigger={
        <>
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
        </>
      }
    >
      {(close) => (
        <div className="max-h-[70vh] overflow-y-auto themed-scroll p-4">
          <NotificationsPanel onClose={close} />
        </div>
      )}
    </Popover>
  );
}
