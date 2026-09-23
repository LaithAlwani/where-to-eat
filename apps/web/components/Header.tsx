"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@repo/backend";
import { Dialog } from "./ui/Dialog";
import { AuthPanel } from "./AuthPanel";
import { NotificationsBell } from "./NotificationsBell";
import { ThemeToggle } from "./ThemeToggle";

type NavLink = {
  href: string;
  label: string;
  icon: string;
  show: boolean;
  primary?: boolean;
};

/**
 * Mobile-first app header. On phones: brand + notifications + theme toggle + a
 * hamburger that opens a menu dialog. From md up the nav links sit inline, with
 * "أضف مطعم" as the amber CTA. Links are defined once and rendered in both places.
 */
export function Header() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = useQuery(api.admin.isAdmin);
  const { isAuthenticated } = useConvexAuth();

  const links: NavLink[] = (
    [
      { href: "/submit", label: "أضف مطعم", icon: "add", show: true, primary: true },
      { href: "/dashboard", label: "لوحة التحكم", icon: "grid_view", show: true },
      { href: "/favorites", label: "المفضلة", icon: "favorite", show: true },
      { href: "/submissions", label: "طلباتي", icon: "receipt_long", show: isAuthenticated },
      { href: "/admin", label: "الإدارة", icon: "shield", show: isAdmin === true },
    ] satisfies NavLink[]
  ).filter((l) => l.show);

  const ghostPill =
    "inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";
  const ctaPill =
    "inline-flex items-center gap-1.5 rounded-pill bg-brand-500 px-4 py-2 text-sm font-bold text-on-accent transition hover:bg-brand-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="cursor-pointer font-heading text-xl font-black text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            وين ناكل
          </Link>

          {/* Desktop location (static) */}
          <button
            type="button"
            className="hidden h-11 cursor-pointer items-center gap-1.5 rounded-pill border border-line-2 px-4 text-sm font-medium text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:inline-flex"
          >
            <span className="ms text-[1.25rem] text-accent-ink" aria-hidden>
              location_on
            </span>
            دمشق
            <span className="ms text-[1.25rem] text-ink-muted" aria-hidden>
              expand_more
            </span>
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={l.primary ? ctaPill : ghostPill}
            >
              <span className="ms text-[1.25rem]" aria-hidden>
                {l.icon}
              </span>
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
          {isAuthenticated && <NotificationsBell />}
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            className={ghostPill}
          >
            <span className="ms text-[1.25rem]" aria-hidden>
              account_circle
            </span>
            الحساب
          </button>
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && <NotificationsBell />}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="القائمة"
            className="flex size-11 cursor-pointer items-center justify-center rounded-pill border border-line text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span className="ms text-[1.5rem]" aria-hidden>
              menu
            </span>
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
              className="flex cursor-pointer items-center gap-3 rounded-card px-3 py-3 text-base font-medium text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span
                className={`ms text-[1.375rem] ${l.primary ? "text-accent-ink" : ""}`}
                aria-hidden
              >
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
            className="flex cursor-pointer items-center gap-3 rounded-card px-3 py-3 text-start text-base font-medium text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span className="ms text-[1.375rem]" aria-hidden>
              account_circle
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
