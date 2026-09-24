"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { Dialog } from "./ui/Dialog";
import { AuthPanel } from "./AuthPanel";
import { AccountMenu } from "./AccountMenu";
import { NotificationsBell } from "./NotificationsBell";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Consumer-first header. The top bar stays minimal (brand, add-a-place as a
 * secondary action, favorites, account). Personal + role-gated tools
 * (طلباتي / لوحة التحكم / الإدارة) live inside the account menu, revealed by
 * role — everyday visitors never see business/admin entries.
 */
export function Header() {
  const { isAuthenticated } = useConvexAuth();
  const [accountOpen, setAccountOpen] = useState(false); // signed-in menu
  const [authOpen, setAuthOpen] = useState(false); // signed-out login/signup
  const [menuOpen, setMenuOpen] = useState(false); // mobile sheet

  const ghostPill =
    "inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

  function openAccount() {
    if (isAuthenticated) setAccountOpen(true);
    else setAuthOpen(true);
  }

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
          <span className="hidden h-11 items-center gap-1.5 rounded-pill border border-line-2 px-4 text-sm font-medium text-ink md:inline-flex">
            <span className="ms text-[1.25rem] text-accent-ink" aria-hidden>
              location_on
            </span>
            دمشق
          </span>
        </div>

        {/* Desktop nav — everyday only */}
        <nav className="hidden items-center gap-1.5 md:flex">
          <Link href="/submit" className={ghostPill}>
            <span className="ms text-[1.25rem]" aria-hidden>
              add
            </span>
            أضف مطعم
          </Link>
          {isAuthenticated && (
            <Link href="/favorites" className={ghostPill}>
              <span className="ms text-[1.25rem]" aria-hidden>
                favorite
              </span>
              المفضلة
            </Link>
          )}
          <ThemeToggle />
          {isAuthenticated && <NotificationsBell />}
          <button type="button" onClick={openAccount} className={ghostPill}>
            <span className="ms text-[1.25rem]" aria-hidden>
              account_circle
            </span>
            {isAuthenticated ? "حسابي" : "تسجيل الدخول"}
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

      {/* Mobile menu: everyday links + (account section | sign-in) */}
      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="القائمة">
        <nav className="flex flex-col gap-1">
          {[
            { href: "/", label: "الرئيسية", icon: "home" },
            { href: "/favorites", label: "المفضلة", icon: "favorite" },
            { href: "/submit", label: "أضف مطعم", icon: "add" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="flex cursor-pointer items-center gap-3 rounded-card px-3 py-3 text-base font-medium text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span className="ms text-[1.375rem]" aria-hidden>
                {l.icon}
              </span>
              {l.label}
            </Link>
          ))}

          <div className="my-1 h-px bg-line" />

          {isAuthenticated ? (
            <AccountMenu onNavigate={() => setMenuOpen(false)} />
          ) : (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setAuthOpen(true);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-card px-3 py-3 text-start text-base font-medium text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span className="ms text-[1.375rem]" aria-hidden>
                account_circle
              </span>
              تسجيل الدخول
            </button>
          )}
        </nav>
      </Dialog>

      {/* Desktop account menu (signed in) */}
      <Dialog open={accountOpen} onClose={() => setAccountOpen(false)} title="حسابي">
        <AccountMenu onNavigate={() => setAccountOpen(false)} />
      </Dialog>

      {/* Login / signup (signed out) */}
      <Dialog open={authOpen} onClose={() => setAuthOpen(false)} title="الحساب">
        <AuthPanel />
      </Dialog>
    </header>
  );
}
