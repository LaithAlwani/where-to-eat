"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend";
import { toEasternArabicDigits } from "@repo/shared/arabic";
import { CoverImage } from "@/components/CoverImage";

/**
 * "الأعلى تقييماً" — a ranked list of the top-rated restaurants. Big rank
 * numerals, a square thumbnail, name/location, and an amber rating.
 */
export function TopRatedList() {
  const restaurants = useQuery(api.restaurants.discoveryTopRated, { limit: 6 });

  if (restaurants !== undefined && restaurants.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl font-black text-ink md:text-3xl">
        الأعلى تقييماً
      </h2>

      {restaurants === undefined ? (
        <ul className="flex flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-4 border-b border-line py-4"
            >
              <div className="h-10 w-8 animate-pulse rounded bg-surface-muted" />
              <div className="size-16 animate-pulse rounded-xl bg-surface-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-1/2 animate-pulse rounded bg-surface-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col">
          {restaurants.map((r, i) => {
            const location = [r.cityNameAr, r.neighborhoodNameAr]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={r.id}>
                <Link
                  href={`/restaurant/${r.slug}`}
                  className="group flex cursor-pointer items-center gap-3 border-b border-line py-3 transition focus-visible:outline-none md:gap-4 md:py-4"
                >
                  <span
                    className="min-w-9 text-center font-heading text-4xl font-black text-ink-muted/40"
                    aria-hidden
                  >
                    {toEasternArabicDigits(i + 1)}
                  </span>
                  <CoverImage
                    url={r.coverUrl}
                    nameAr={r.nameAr}
                    rounded="rounded-xl"
                    className="size-16 shrink-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="truncate font-heading text-lg font-black text-ink transition group-hover:text-accent-ink">
                      {r.nameAr}
                    </h3>
                    {location && (
                      <p className="truncate text-sm text-ink-muted">{location}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-heading text-2xl font-black text-accent-ink md:text-3xl">
                    {toEasternArabicDigits(r.ratingAvg.toFixed(1))}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
