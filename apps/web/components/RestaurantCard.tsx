import Link from "next/link";
import type { RestaurantCard as Card } from "@/lib/types";
import { CoverImage } from "./CoverImage";
import { RatingStars } from "./RatingStars";
import { PriceTier } from "./PriceTier";

/**
 * Discovery/list card linking to the restaurant profile. RTL-correct: content
 * is start-aligned and the meta row uses logical spacing. Rounded-card with a
 * hover elevation.
 */
export function RestaurantCard({ restaurant }: { restaurant: Card }) {
  const location = [restaurant.cityNameAr, restaurant.neighborhoodNameAr]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/restaurant/${restaurant.slug}`}
      className="group flex flex-col overflow-hidden rounded-card bg-surface shadow-sm ring-1 ring-ink/5 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <CoverImage
        coverKey={restaurant.coverKey}
        nameAr={restaurant.nameAr}
        rounded=""
        className="aspect-[4/3] w-full"
        glyphClassName="text-5xl"
      />
      <div className="flex flex-1 flex-col gap-2 p-4 text-start">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-bold text-ink transition group-hover:text-brand-600">
            {restaurant.nameAr}
          </h3>
          {restaurant.nameEn && (
            <p className="text-xs text-ink-muted" dir="ltr">
              {restaurant.nameEn}
            </p>
          )}
        </div>
        {location && (
          <p className="text-sm text-ink-muted">{location}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <RatingStars
            value={restaurant.ratingAvg}
            count={restaurant.ratingCount}
          />
          <PriceTier tier={restaurant.priceTier} />
        </div>
      </div>
    </Link>
  );
}
