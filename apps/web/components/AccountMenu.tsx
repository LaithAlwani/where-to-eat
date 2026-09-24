"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@repo/backend";
import { authClient } from "@/lib/auth-client";

const ROLE_LABEL: Record<string, string> = {
  user: "مستخدم",
  owner: "صاحب مكان",
  admin: "مشرف",
};

const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-card px-3 py-3 text-base font-medium text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

/**
 * Personal + role-gated account menu (content only; the caller wraps it in a
 * Dialog). طلباتي for any signed-in user; لوحة التحكم for owners/admins; الإدارة
 * for admins. Everyday links (home/favorites/add) live in the top bar, not here.
 */
export function AccountMenu({ onNavigate }: { onNavigate: () => void }) {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const role = user?.role;
  const isOwner = role === "owner" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <nav className="flex flex-col gap-1">
      <div className="flex flex-col gap-0.5 px-3 pb-2">
        <span className="font-heading text-lg font-bold text-ink">
          {user?.name ?? "حسابي"}
        </span>
        {role && (
          <span className="text-sm text-ink-muted">{ROLE_LABEL[role] ?? role}</span>
        )}
      </div>

      <Link href="/submissions" onClick={onNavigate} className={itemClass}>
        <span className="ms text-[1.375rem]" aria-hidden>
          receipt_long
        </span>
        طلباتي
      </Link>

      {isOwner && (
        <Link href="/dashboard" onClick={onNavigate} className={itemClass}>
          <span className="ms text-[1.375rem]" aria-hidden>
            grid_view
          </span>
          لوحة التحكم
        </Link>
      )}

      {isAdmin && (
        <Link href="/admin" onClick={onNavigate} className={itemClass}>
          <span className="ms text-[1.375rem]" aria-hidden>
            shield
          </span>
          الإدارة
        </Link>
      )}

      <div className="my-1 h-px bg-line" />

      <button
        type="button"
        onClick={() => {
          void authClient.signOut();
          onNavigate();
        }}
        className={`${itemClass} text-start`}
      >
        <span className="ms text-[1.375rem]" aria-hidden>
          logout
        </span>
        تسجيل الخروج
      </button>
    </nav>
  );
}
