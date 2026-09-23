import Link from "next/link";

/**
 * Compact search entry point on the home page. It's a link (not a live input);
 * the real search UI lives on /search.
 */
export function SearchPill() {
  return (
    <Link
      href="/search"
      className="flex w-full cursor-pointer items-center gap-3 rounded-pill border border-line bg-surface px-5 py-4 text-ink-muted transition hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <span className="ms text-[1.375rem] text-accent-ink" aria-hidden>
        search
      </span>
      ابحث عن مطعم أو نوع أكل
    </Link>
  );
}
