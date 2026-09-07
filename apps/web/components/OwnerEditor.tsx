"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { StatusBadge } from "./StatusBadge";
import { OwnerInfoForm } from "./OwnerInfoForm";
import { OwnerPhotos } from "./OwnerPhotos";
import { MenuEditor } from "./MenuEditor";
import { OwnerReviews } from "./OwnerReviews";

const TABS = [
  { key: "info", label: "معلومات" },
  { key: "photos", label: "الصور" },
  { key: "menu", label: "القائمة" },
  { key: "reviews", label: "التقييمات" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/**
 * Owner editor shell: loads the editable restaurant (owner/admin only) and hosts
 * the sectioned editors. Handles loading (skeleton) and unauthorized (null).
 */
export function OwnerEditor({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const restaurant = useQuery(api.owner.getMyRestaurant, { restaurantId });
  const [tab, setTab] = useState<TabKey>("info");

  if (restaurant === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-muted" />
        <div className="h-64 animate-pulse rounded-card bg-surface-muted" />
      </div>
    );
  }

  if (restaurant === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-5xl">
          🚫
        </span>
        <h2 className="text-xl font-bold text-ink">
          لا تملك صلاحية تعديل هذا المكان
        </h2>
        <Link
          href="/dashboard"
          className="mt-2 rounded-pill bg-brand-500 px-6 py-2 font-medium text-white transition hover:bg-brand-600"
        >
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-ink">{restaurant.nameAr}</h1>
          <StatusBadge status={restaurant.status} />
        </div>
        {restaurant.status === "published" && (
          <Link
            href={`/restaurant/${restaurant.slug}`}
            className="w-fit text-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            عرض الصفحة العامة ↗
          </Link>
        )}
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-ink/5 pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-current={tab === t.key}
            className={`rounded-pill px-4 py-1.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-brand-500 text-white"
                : "text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div>
        {tab === "info" && <OwnerInfoForm restaurant={restaurant} />}
        {tab === "photos" && <OwnerPhotos restaurant={restaurant} />}
        {tab === "menu" && <MenuEditor restaurant={restaurant} />}
        {tab === "reviews" && <OwnerReviews restaurantId={restaurant.id} />}
      </div>
    </div>
  );
}
