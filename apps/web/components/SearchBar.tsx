"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * Search input that navigates to /search?q=… on submit. Client-side because it
 * uses the router; the search icon is decorative.
 */
export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative w-full">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-lg text-ink-muted"
      >
        🔍
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="ابحث عن مطعم أو كافيه أو نوع أكل…"
        aria-label="ابحث"
        className="w-full rounded-pill border border-ink/10 bg-surface py-3 ps-12 pe-4 text-ink shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
      />
    </form>
  );
}
