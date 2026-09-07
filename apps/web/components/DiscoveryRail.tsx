import Link from "next/link";
import type { RestaurantCard as Card } from "@/lib/types";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantCardSkeleton } from "./RestaurantCardSkeleton";

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
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
          {emoji && <span aria-hidden>{emoji}</span>}
          {title}
        </h2>
        {hrefMore && (
          <Link
            href={hrefMore}
            className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700"
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
    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
      {children}
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-56 shrink-0 snap-start sm:w-64">{children}</div>
  );
}
