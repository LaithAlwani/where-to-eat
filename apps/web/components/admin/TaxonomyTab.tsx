"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { getErrorMessage } from "@/lib/errors";
import { labelClass } from "@/lib/ui";
import { useToast } from "../ui/ToastProvider";
import { AddTaxonomyForm } from "./AddTaxonomyForm";

/** Taxonomy tab: add-forms + current lists for cities, neighborhoods, categories, cuisines. */
export function TaxonomyTab() {
  const { toast } = useToast();
  const cities = useQuery(api.taxonomy.listCities);
  const categories = useQuery(api.taxonomy.listCategories);
  const cuisines = useQuery(api.taxonomy.listCuisines);

  const addCity = useMutation(api.admin.addCity);
  const setCityActive = useMutation(api.admin.setCityActive);
  const addNeighborhood = useMutation(api.admin.addNeighborhood);
  const addCategory = useMutation(api.admin.addCategory);
  const addCuisine = useMutation(api.admin.addCuisine);

  const [neighborhoodCityId, setNeighborhoodCityId] = useState("");

  async function toggleCity(cityId: Id<"cities">, isActive: boolean) {
    try {
      await setCityActive({ cityId, isActive });
      toast({
        title: isActive ? "تم التفعيل" : "تم الإيقاف",
        variant: "success",
      });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Cities */}
      <section className="flex flex-col gap-3">
        <AddTaxonomyForm
          title="إضافة مدينة"
          onSubmit={async ({ nameAr, nameEn, slug }) => {
            await addCity({ nameAr, nameEn, slug });
          }}
        />
        <TaxonomyList
          items={cities}
          emptyMessage="لا توجد مدن نشطة"
          renderMeta={(city) => (
            <button
              type="button"
              onClick={() => toggleCity(city.id, false)}
              className="rounded-pill border border-ink-muted/30 px-3 py-1 text-xs font-medium text-ink transition hover:bg-surface-muted"
            >
              إيقاف
            </button>
          )}
        />
      </section>

      {/* Neighborhoods */}
      <section className="flex flex-col gap-3">
        <AddTaxonomyForm
          title="إضافة حي"
          canSubmit={neighborhoodCityId !== ""}
          leading={
            <label className={labelClass}>
              المدينة
              <select
                value={neighborhoodCityId}
                onChange={(e) => setNeighborhoodCityId(e.target.value)}
                className="w-full rounded-card border border-ink/10 bg-surface px-3 py-2 text-ink"
              >
                <option value="">اختر مدينة…</option>
                {cities?.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.nameAr}
                  </option>
                ))}
              </select>
            </label>
          }
          onSubmit={async ({ nameAr, nameEn, slug }) => {
            await addNeighborhood({
              cityId: neighborhoodCityId as Id<"cities">,
              nameAr,
              nameEn,
              slug,
            });
            setNeighborhoodCityId("");
          }}
        />
      </section>

      {/* Categories */}
      <section className="flex flex-col gap-3">
        <AddTaxonomyForm
          title="إضافة تصنيف"
          withIcon
          onSubmit={async ({ nameAr, nameEn, slug, icon }) => {
            await addCategory({ nameAr, nameEn, slug, icon });
          }}
        />
        <TaxonomyList
          items={categories}
          emptyMessage="لا توجد تصنيفات"
          renderMeta={(cat) =>
            cat.icon ? (
              <span aria-hidden className="text-lg">
                {cat.icon}
              </span>
            ) : null
          }
        />
      </section>

      {/* Cuisines */}
      <section className="flex flex-col gap-3">
        <AddTaxonomyForm
          title="إضافة نوع مطبخ"
          onSubmit={async ({ nameAr, nameEn, slug }) => {
            await addCuisine({ nameAr, nameEn, slug });
          }}
        />
        <TaxonomyList items={cuisines} emptyMessage="لا توجد أنواع مطابخ" />
      </section>
    </div>
  );
}

type TaxonomyItem = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  icon?: string;
};

function TaxonomyList<T extends TaxonomyItem>({
  items,
  emptyMessage,
  renderMeta,
}: {
  items: T[] | undefined;
  emptyMessage: string;
  renderMeta?: (item: T) => React.ReactNode;
}) {
  if (items === undefined) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-card bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-card bg-surface px-4 py-2 ring-1 ring-ink/5"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink">{item.nameAr}</span>
            <span className="text-xs text-ink-muted" dir="ltr">
              {item.slug}
            </span>
          </div>
          {renderMeta?.(item)}
        </li>
      ))}
    </ul>
  );
}
