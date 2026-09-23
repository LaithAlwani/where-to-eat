"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@repo/backend";
import { Dialog } from "./ui/Dialog";
import { AuthPanel } from "./AuthPanel";
import { NotificationsBell } from "./NotificationsBell";

/**
 * Mobile-first app header. On phones: brand + notifications + a hamburger that
 * opens a menu dialog. From md up: the nav links sit inline. Links are defined
 * once and rendered in both places.
 */
export function Header() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = useQuery(api.admin.isAdmin);
  const { isAuthenticated } = useConvexAuth();

  const links = [
    { href: "/submit", label: "أضف مطعم", icon: "＋", show: true },
    { href: "/dashboard", label: "لوحة التحكم", icon: "📊", show: true },
    { href: "/favorites", label: "المفضلة", icon: "❤️", show: true },
    { href: "/submissions", label: "طلباتي", icon: "📝", show: isAuthenticated },
    { href: "/admin", label: "الإدارة", icon: "🛡️", show: isAdmin === true },
  ].filter((l) => l.show);

  const pill =
    "inline-flex items-center gap-1.5 rounded-pill border border-ink/10 px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-muted";

  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-bold text-brand-700"
        >
          <span aria-hidden>🍽️</span>
          وين ناكل
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={pill}>
              <span aria-hidden>{l.icon}</span> {l.label}
            </Link>
          ))}
          {isAuthenticated && <NotificationsBell />}
          <button type="button" onClick={() => setAccountOpen(true)} className={pill}>
            الحساب
          </button>
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && <NotificationsBell />}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="القائمة"
            className="flex size-10 items-center justify-center rounded-pill border border-ink/10 text-xl text-ink transition hover:bg-surface-muted"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="القائمة">
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-card px-3 py-3 text-base font-medium text-ink transition hover:bg-surface-muted"
            >
              <span aria-hidden className="text-lg">
                {l.icon}
              </span>
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setAccountOpen(true);
            }}
            className="flex items-center gap-3 rounded-card px-3 py-3 text-start text-base font-medium text-ink transition hover:bg-surface-muted"
          >
            <span aria-hidden className="text-lg">
              👤
            </span>
            الحساب
          </button>
        </nav>
      </Dialog>

      <Dialog open={accountOpen} onClose={() => setAccountOpen(false)} title="الحساب">
        <AuthPanel />
      </Dialog>
    </header>
  );
}
