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
            className="h-8 w-20 animate-pulse rounded-pill bg-surface-muted"
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
            className="inline-flex items-center rounded-pill bg-accent-50 px-4 py-1.5 text-sm font-medium text-accent-700 transition hover:bg-accent-100"
          >
            {city.nameAr}
          </Link>
        </li>
      ))}
    </ul>
  );
}
