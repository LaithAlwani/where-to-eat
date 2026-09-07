"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend";
import { CoverImage } from "./CoverImage";
import { RatingStars } from "./RatingStars";
import { PriceTier } from "./PriceTier";
import { ProfileActions } from "./ProfileActions";
import { OpeningHours } from "./OpeningHours";
import { RestaurantMenu } from "./RestaurantMenu";
import { ProfileSkeleton } from "./ProfileSkeleton";

/**
 * Client-side restaurant profile. Loads via useQuery(getBySlug): shows a
 * skeleton while undefined and a friendly not-found state when null.
 */
export function RestaurantProfile({ slug }: { slug: string }) {
  const data = useQuery(api.restaurants.getBySlug, { slug });

  if (data === undefined) return <ProfileSkeleton />;

  if (data === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface-muted px-6 py-20 text-center">
        <span aria-hidden className="text-5xl">
          🍽️
        </span>
        <h1 className="text-xl font-bold text-ink">لم نجد هذا المكان</h1>
        <p className="text-ink-muted">
          ربما تغيّر الرابط أو لم يعد المطعم متاحاً.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-pill bg-brand-500 px-6 py-2 font-medium text-white transition hover:bg-brand-600"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const location = [data.cityNameAr, data.neighborhoodNameAr]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="flex flex-col gap-8">
      <CoverImage
        coverKey={data.coverKey}
        nameAr={data.nameAr}
        className="h-56 w-full sm:h-72"
        glyphClassName="text-7xl"
      />

      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-ink">{data.nameAr}</h1>
          {data.nameEn && (
            <p className="text-ink-muted" dir="ltr">
              {data.nameEn}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <RatingStars
            value={data.ratingAvg}
            count={data.ratingCount}
            size="md"
          />
          <PriceTier tier={data.priceTier} size="md" />
          <span className="text-ink-muted">{location}</span>
        </div>

        {(data.categories.length > 0 || data.cuisines.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {data.categories.map((category) => (
              <Link
                key={`cat-${category.slug}`}
                href={`/category/${category.slug}`}
                className="rounded-pill bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
              >
                {category.nameAr}
              </Link>
            ))}
            {data.cuisines.map((cuisine) => (
              <Link
                key={`cui-${cuisine.slug}`}
                href={`/cuisine/${cuisine.slug}`}
                className="rounded-pill bg-accent-50 px-3 py-1 text-sm font-medium text-accent-700 transition hover:bg-accent-100"
              >
                {cuisine.nameAr}
              </Link>
            ))}
          </div>
        )}
      </header>

      <ProfileActions nameAr={data.nameAr} phone={data.phone} geo={data.geo} />

      {data.descriptionAr && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">نبذة</h2>
          <p className="leading-relaxed text-ink-muted">{data.descriptionAr}</p>
        </section>
      )}

      <section id="location" className="flex flex-col gap-3 scroll-mt-20">
        <h2 className="text-lg font-bold text-ink">الموقع والتواصل</h2>
        <p className="text-ink">{location}</p>
        {data.address && <p className="text-ink-muted">{data.address}</p>}

        <div className="flex flex-wrap gap-2 pt-1">
          {data.whatsapp && (
            <ContactLink
              href={`https://wa.me/${data.whatsapp.replace(/[^\d]/g, "")}`}
              emoji="💬"
              label="واتساب"
            />
          )}
          {data.instagram && (
            <ContactLink
              href={`https://instagram.com/${data.instagram.replace(/^@/, "")}`}
              emoji="📷"
              label="إنستغرام"
            />
          )}
          {data.website && (
            <ContactLink href={data.website} emoji="🌐" label="الموقع الإلكتروني" />
          )}
        </div>
      </section>

      {data.hours && data.hours.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink">أوقات العمل</h2>
          <OpeningHours hours={data.hours} />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-ink">قائمة الطعام</h2>
        {data.menu && data.menu.length > 0 ? (
          <RestaurantMenu menu={data.menu} />
        ) : (
          <p className="rounded-card bg-surface-muted px-4 py-6 text-center text-ink-muted">
            لم تتم إضافة قائمة الطعام بعد
          </p>
        )}
      </section>
    </article>
  );
}

function ContactLink({
  href,
  emoji,
  label,
}: {
  href: string;
  emoji: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-4 py-1.5 text-sm font-medium text-ink ring-1 ring-ink/10 transition hover:bg-surface-muted"
    >
      <span aria-hidden>{emoji}</span>
      {label}
    </a>
  );
}
