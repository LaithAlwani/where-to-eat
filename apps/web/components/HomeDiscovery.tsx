"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@repo/backend";
import { DiscoveryRail } from "./DiscoveryRail";

/**
 * The homepage discovery rails. Each rail owns its own query and renders
 * loading/empty states via <DiscoveryRail />.
 */
export function HomeDiscovery() {
  const topRated = useQuery(api.restaurants.discoveryTopRated, { limit: 12 });
  const newest = useQuery(api.restaurants.discoveryNewest, { limit: 12 });

  const cafes = usePaginatedQuery(
    api.restaurants.listByCategory,
    { categorySlug: "cafes" },
    { initialNumItems: 12 },
  );
  const burgers = usePaginatedQuery(
    api.restaurants.listByCuisine,
    { cuisineSlug: "burger" },
    { initialNumItems: 12 },
  );

  return (
    <div className="flex flex-col gap-10">
      <DiscoveryRail
        title="الأعلى تقييماً"
        emoji="⭐"
        restaurants={topRated}
      />
      <DiscoveryRail title="جديد" emoji="🆕" restaurants={newest} />
      <DiscoveryRail
        title="كافيهات"
        emoji="☕"
        restaurants={railData(cafes)}
        hrefMore="/category/cafes"
      />
      <DiscoveryRail
        title="برغر"
        emoji="🍔"
        restaurants={railData(burgers)}
        hrefMore="/cuisine/burger"
      />
    </div>
  );
}

/**
 * Map a usePaginatedQuery result to the rail's `Card[] | undefined` contract:
 * `undefined` only during the first page load so the rail shows skeletons.
 */
function railData<T>(result: {
  results: T[];
  status: string;
}): T[] | undefined {
  return result.status === "LoadingFirstPage" ? undefined : result.results;
}
