"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "@repo/backend";
import { toEasternArabicDigits } from "@repo/shared/arabic";
import type { RestaurantCard } from "@/lib/types";
import { CoverImage } from "@/components/CoverImage";
import { useToast } from "@/components/ui/ToastProvider";
import { getErrorMessage } from "@/lib/errors";

/** price tier → "$ · label" chip text (teal). */
const PRICE_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "$ · رخيص",
  2: "$$ · وسط",
  3: "$$$ · راقٍ",
  4: "$$$$ · فخم",
};

/** Eastern-Arabic rating with an Arabic decimal comma, e.g. "٤،٥". */
function ratingText(avg: number): string {
  return toEasternArabicDigits(avg.toFixed(1)).replace(".", "،");
}

/**
 * The homepage centerpiece: one confident "here's where you eat" answer, drawn
 * from the top-rated set. "جرّب غيرو" cycles to the next pick. Renders skeleton
 * while loading and nothing when there are no restaurants yet.
 */
export function FeaturedPick() {
  const picks = useQuery(api.restaurants.discoveryTopRated, { limit: 6 });
  const [pickIdx, setPickIdx] = useState(0);

  if (picks === undefined) return <FeaturedSkeleton />;
  if (picks.length === 0) return null;

  const pick = picks[pickIdx % picks.length]!;

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="relative">
        <CoverImage
          url={pick.coverUrl}
          nameAr={pick.nameAr}
          rounded=""
          className="aspect-[16/11] w-full md:aspect-[16/10]"
        />
        <span className="absolute top-4 inset-s-4 inline-flex items-center rounded-pill bg-brand-500 px-3 py-1 font-heading text-sm font-bold text-on-accent shadow-sm">
          مفتوح الآن
        </span>
        <FavoriteToggle restaurant={pick} />
      </div>

      <div className="flex flex-col gap-5 p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="font-heading text-3xl font-black leading-tight text-ink md:text-5xl">
              {pick.nameAr}
            </h2>
            {pick.nameEn && (
              <p dir="ltr" className="truncate text-start text-ink-muted">
                {pick.nameEn}
              </p>
            )}
            <p className="mt-1 text-ink-muted">
              {pick.cityNameAr}
              {" · "}
              <span className="font-bold text-accent-600" aria-hidden>
                {"$".repeat(pick.priceTier)}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center">
            <span className="font-heading text-4xl font-black leading-none text-accent-ink md:text-6xl">
              {ratingText(pick.ratingAvg)}
            </span>
            <span className="mt-1.5 text-sm text-ink-muted">
              {toEasternArabicDigits(pick.ratingCount)} تقييم
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-pill border border-accent-600/40 px-3 py-1 text-sm font-medium text-accent-600">
            {PRICE_LABEL[pick.priceTier]}
          </span>
          {pick.neighborhoodNameAr && (
            <span className="inline-flex items-center rounded-pill border border-line px-3 py-1 text-sm font-medium text-ink-muted">
              {pick.neighborhoodNameAr}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/restaurant/${pick.slug}`}
            className="inline-flex h-14 cursor-pointer items-center justify-center rounded-pill bg-brand-500 font-heading text-base font-black text-on-accent transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:h-15"
          >
            خدني لهون
          </Link>
          <button
            type="button"
            onClick={() => setPickIdx((i) => (i + 1) % picks.length)}
            className="inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-pill border border-line-2 font-heading text-base font-black text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:h-15"
          >
            <span className="ms text-[1.25rem]" aria-hidden>
              shuffle
            </span>
            <span className="md:hidden">جرّب غيرو</span>
            <span className="hidden md:inline">اقترح غيرو</span>
          </button>
        </div>
      </div>
    </article>
  );
}

/** Round favorite button overlaid on the cover (top-end). */
function FavoriteToggle({ restaurant }: { restaurant: RestaurantCard }) {
  const { isAuthenticated } = useConvexAuth();
  const { toast } = useToast();
  const isFavorite = useQuery(
    api.favorites.isFavorite,
    isAuthenticated ? { restaurantId: restaurant.id } : "skip",
  );
  const toggle = useMutation(api.favorites.toggle);
  const [busy, setBusy] = useState(false);
  const favorited = isFavorite === true;

  async function onClick() {
    if (!isAuthenticated) {
      toast({ title: "سجّل الدخول لحفظ المكان", variant: "error" });
      return;
    }
    setBusy(true);
    try {
      const result = await toggle({ restaurantId: restaurant.id });
      toast({
        title: result.favorited ? "أُضيف إلى المفضلة" : "أُزيل من المفضلة",
        variant: "success",
      });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={favorited}
      aria-label={favorited ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      className="absolute top-4 inset-e-4 flex size-11 cursor-pointer items-center justify-center rounded-pill bg-bg/70 text-accent-ink backdrop-blur transition hover:bg-bg/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"
    >
      <span
        className="ms text-[1.5rem]"
        style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}
        aria-hidden
      >
        favorite
      </span>
    </button>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="aspect-[16/11] w-full animate-pulse bg-surface-muted md:aspect-[16/10]" />
      <div className="flex flex-col gap-5 p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-9 w-3/4 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-muted" />
          </div>
          <div className="h-12 w-16 animate-pulse rounded bg-surface-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded-pill bg-surface-muted" />
          <div className="h-8 w-20 animate-pulse rounded-pill bg-surface-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 animate-pulse rounded-pill bg-surface-muted" />
          <div className="h-14 animate-pulse rounded-pill bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}
