"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend";

/**
 * "مدن سوريا" — city picker. Mobile: a horizontal chip rail; desktop: a 2-col
 * grid of city cards with an amber arrow affordance.
 */
export function CitiesSection() {
  const cities = useQuery(api.taxonomy.listCities);

  if (cities !== undefined && cities.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl font-black text-ink md:text-3xl">
        مدن سوريا
      </h2>

      {cities === undefined ? (
        <>
          <div className="-mx-4 flex gap-2 overflow-hidden px-4 md:hidden" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-24 shrink-0 animate-pulse rounded-pill bg-surface-muted"
              />
            ))}
          </div>
          <div className="hidden gap-3 md:grid md:grid-cols-2" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-card bg-surface-muted"
              />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Mobile: chip rail */}
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar md:hidden">
            {cities.map((city) => (
              <li key={city.id} className="shrink-0">
                <Link
                  href={`/city/${city.slug}`}
                  className="inline-flex min-h-11 cursor-pointer items-center rounded-pill border border-line px-5 font-heading font-black text-ink transition hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {city.nameAr}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: card grid */}
          <ul className="hidden gap-3 md:grid md:grid-cols-2">
            {cities.map((city) => (
              <li key={city.id}>
                <Link
                  href={`/city/${city.slug}`}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-card border border-line bg-surface px-5 py-5 transition hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span className="flex flex-col">
                    <span className="font-heading text-2xl font-black text-ink">
                      {city.nameAr}
                    </span>
                    <span dir="ltr" className="text-start text-sm text-ink-muted">
                      {city.nameEn}
                    </span>
                  </span>
                  <span className="ms text-2xl text-accent-ink" aria-hidden>
                    arrow_back
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
