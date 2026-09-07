"use client";

import Link from "next/link";
import { useState } from "react";
import { Dialog } from "./ui/Dialog";
import { AuthPanel } from "./AuthPanel";

/**
 * App header: brand link home + an "الحساب" button that opens the existing
 * AuthPanel inside an accessible Dialog (sign-in/out stays reachable app-wide).
 */
export function Header() {
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-extrabold text-brand-600"
        >
          <span aria-hidden>🍽️</span>
          وين ناكل
        </Link>

        <button
          type="button"
          onClick={() => setAccountOpen(true)}
          className="rounded-pill border border-ink/10 px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-muted"
        >
          الحساب
        </button>
      </div>

      <Dialog
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        title="الحساب"
      >
        <AuthPanel />
      </Dialog>
    </header>
  );
}
