"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { ComponentType } from "react";
import { Dialog } from "./ui/Dialog";
import { AuthPanel } from "./AuthPanel";
import { NotificationsBell } from "./NotificationsBell";

type IconProps = { className?: string };

const iconBase = "size-4";

function PlusIcon({ className = iconBase }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function GridIcon({ className = iconBase }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function HeartIcon({ className = iconBase }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function DocumentIcon({ className = iconBase }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

function ShieldIcon({ className = iconBase }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    </svg>
  );
}

function UserIcon({ className = iconBase }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}

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

  const links: {
    href: string;
    label: string;
    Icon: ComponentType<IconProps>;
    show: boolean;
  }[] = [
    { href: "/submit", label: "أضف مطعم", Icon: PlusIcon, show: true },
    { href: "/dashboard", label: "لوحة التحكم", Icon: GridIcon, show: true },
    { href: "/favorites", label: "المفضلة", Icon: HeartIcon, show: true },
    { href: "/submissions", label: "طلباتي", Icon: DocumentIcon, show: isAuthenticated },
    { href: "/admin", label: "الإدارة", Icon: ShieldIcon, show: isAdmin === true },
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
              <l.Icon /> {l.label}
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
              <l.Icon className="size-5" />
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
            <UserIcon className="size-5" />
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
