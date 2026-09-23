import Link from "next/link";
import type { RestaurantCard as Card } from "@/lib/types";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantCardSkeleton } from "./RestaurantCardSkeleton";
import { ScrollRail } from "./ScrollRail";

type DiscoveryRailProps = {
  title: string;
  emoji?: string;
  restaurants: Card[] | undefined;
  hrefMore?: string;
};

/**
 * Horizontal, scrollable rail of restaurant cards with a section header.
 * Handles the three data states first-class: skeletons while `undefined`, a
 * subtle empty message when `[]`, and cards otherwise.
 */
export function DiscoveryRail({
  title,
  emoji,
  restaurants,
  hrefMore,
}: DiscoveryRailProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2.5 font-heading text-2xl font-black text-ink">
          {emoji && (
            <span
              aria-hidden
              className="inline-flex size-9 items-center justify-center rounded-pill bg-surface-muted text-lg text-accent-ink"
            >
              {emoji}
            </span>
          )}
          {title}
        </h2>
        {hrefMore && (
          <Link
            href={hrefMore}
            className="shrink-0 cursor-pointer rounded-pill text-sm font-bold text-accent-ink transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            المزيد ←
          </Link>
        )}
      </div>

      <RailBody restaurants={restaurants} />
    </section>
  );
}

function RailBody({ restaurants }: { restaurants: Card[] | undefined }) {
  if (restaurants === undefined) {
    return (
      <Track>
        {Array.from({ length: 4 }).map((_, i) => (
          <Cell key={i}>
            <RestaurantCardSkeleton />
          </Cell>
        ))}
      </Track>
    );
  }

  if (restaurants.length === 0) {
    return (
      <p className="rounded-card bg-surface-muted px-4 py-6 text-center text-sm text-ink-muted">
        لا توجد أماكن هنا بعد
      </p>
    );
  }

  return (
    <Track>
      {restaurants.map((restaurant) => (
        <Cell key={restaurant.id}>
          <RestaurantCard restaurant={restaurant} />
        </Cell>
      ))}
    </Track>
  );
}

function Track({ children }: { children: React.ReactNode }) {
  return (
    <ScrollRail className="-mx-4 px-4 pb-2">{children}</ScrollRail>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-56 shrink-0 snap-start sm:w-64">{children}</div>
  );
}
