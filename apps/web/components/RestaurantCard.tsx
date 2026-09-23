import Link from "next/link";
import { toEasternArabicDigits } from "@repo/shared/arabic";
import type { RestaurantCard as Card } from "@/lib/types";
import { CoverImage } from "./CoverImage";
import { RatingStars } from "./RatingStars";
import { PriceTier } from "./PriceTier";

/**
 * Image-forward discovery card linking to the restaurant profile. Cover fills
 * the top and zooms on hover; a compact rating badge floats over the image.
 * RTL-correct: content is start-aligned and the meta row uses logical spacing.
 */
export function RestaurantCard({ restaurant }: { restaurant: Card }) {
  const location = [restaurant.cityNameAr, restaurant.neighborhoodNameAr]
    .filter(Boolean)
    .join(" · ");
  const rating = Math.max(0, Math.min(5, restaurant.ratingAvg));

  return (
    <Link
      href={`/restaurant/${restaurant.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 motion-reduce:transition-none motion-reduce:hover:transform-none"
    >
      <div className="relative overflow-hidden">
        <CoverImage
          url={restaurant.coverUrl}
          nameAr={restaurant.nameAr}
          rounded=""
          className="aspect-4/3 w-full transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
          glyphClassName="text-5xl"
        />
        <span className="absolute top-2 inset-s-2 inline-flex items-center gap-1 rounded-pill bg-bg/80 px-2.5 py-1 text-xs font-bold text-ink shadow-sm backdrop-blur">
          <span aria-hidden className="ms text-[1rem] text-accent-ink">
            star
          </span>
          {toEasternArabicDigits(rating.toFixed(1))}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 text-start">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading text-lg font-black text-ink transition group-hover:text-accent-ink">
            {restaurant.nameAr}
          </h3>
          {restaurant.nameEn && (
            <p className="text-xs text-ink-muted" dir="ltr">
              {restaurant.nameEn}
            </p>
          )}
        </div>
        {location && <p className="text-sm text-ink-muted">{location}</p>}
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
