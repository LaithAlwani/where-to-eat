"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend";

/**
 * Live-queries the seeded cities via the shared Convex backend. Demonstrates
 * the end-to-end wiring: the query is indexed, bounded, and returns a projected
 * view-model (no unused fields cross the wire).
 */
export function CityList() {
  const cities = useQuery(api.taxonomy.listCities);

  if (cities === undefined) {
    return <p className="text-ink-muted">جارٍ التحميل…</p>;
  }

  if (cities.length === 0) {
    return (
      <p className="text-ink-muted">
        لا توجد مدن بعد — شغّل أمر التهيئة: <code>convex run seed:seedTaxonomy</code>
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {cities.map((city) => (
        <li
          key={city.id}
          className="rounded-pill bg-brand-50 px-4 py-2 text-brand-700"
        >
          {city.nameAr}
        </li>
      ))}
    </ul>
  );
}
