"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend";

/**
 * City chips linking to the area-browse page (/city/[slug]). Loading/empty
 * states handled first-class.
 */
export function CityChips() {
  const cities = useQuery(api.taxonomy.listCities);

  if (cities === undefined) {
    return (
      <div className="flex flex-wrap gap-2" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-11 w-20 animate-pulse rounded-pill bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (cities.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {cities.map((city) => (
        <li key={city.id}>
          <Link
            href={`/city/${city.slug}`}
            className="inline-flex min-h-11 items-center rounded-pill border border-ink/5 bg-surface-muted px-4 py-2 text-sm font-medium text-ink transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {city.nameAr}
          </Link>
        </li>
      ))}
    </ul>
  );
}
