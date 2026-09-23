"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend";
import { toEasternArabicDigits } from "@repo/shared/arabic";
import type { RestaurantCard } from "@/lib/types";
import { CoverImage } from "@/components/CoverImage";

/**
 * "مفتوح الآن" section. We have no open-now flag, so this is a curated label
 * over the newest places. Mobile: a horizontal snap rail; desktop: a fluid grid.
 */
export function OpenNowSection() {
  const restaurants = useQuery(api.restaurants.discoveryNewest, { limit: 8 });

  if (restaurants !== undefined && restaurants.length === 0) return null;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-2xl font-black text-ink md:text-3xl">
          مفتوح الآن
        </h2>
        <Link
          href="/search"
          className="shrink-0 cursor-pointer rounded-pill text-sm font-bold text-accent-ink transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          الكل ←
        </Link>
      </div>

      {restaurants === undefined ? (
        <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] md:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-60 shrink-0 md:w-auto"
            >
              <div className="h-64 animate-pulse rounded-2xl bg-surface-muted" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {restaurants.map((r) => (
            <li
              key={r.id}
              className="w-60 shrink-0 snap-start md:w-auto"
            >
              <OpenNowCard restaurant={r} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OpenNowCard({ restaurant }: { restaurant: RestaurantCard }) {
  return (
    <Link
      href={`/restaurant/${restaurant.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <CoverImage
        url={restaurant.coverUrl}
        nameAr={restaurant.nameAr}
        rounded=""
        className="aspect-[3/2] w-full"
      />
      <div className="flex flex-1 flex-col gap-1 p-4 text-start">
        <h3 className="font-heading text-lg font-black leading-tight text-ink">
          {restaurant.nameAr}
        </h3>
        <p className="text-sm text-ink-muted">{restaurant.cityNameAr}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-ink">
            <span className="ms text-[1.125rem] text-accent-ink" aria-hidden>
              star
            </span>
            {toEasternArabicDigits(restaurant.ratingAvg.toFixed(1))}
          </span>
          <span className="font-bold text-accent-600" aria-hidden>
            {"$".repeat(restaurant.priceTier)}
          </span>
        </div>
      </div>
    </Link>
  );
}
