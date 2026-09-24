"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { OwnerRestaurant } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import { inputClass, labelClass, hintClass } from "@/lib/ui";
import { useToast } from "./ui/ToastProvider";
import { ChipSelect } from "./ChipSelect";
import { HoursEditor, buildWeek, type HourRow } from "./HoursEditor";
import {
  type PriceTier,
  Required,
  Section,
  ChecklistRow,
  CategoryGrid,
  PriceTierGrid,
  ContactInput,
} from "./RestaurantFormUI";

/**
 * Owner editor "info" tab, in the shared two-pane layout (numbered sections +
 * preview/checklist sidebar) used by the add/edit forms. Owner-specific: keeps
 * opening hours, saves in place (no navigation), and omits city/photos (the
 * location is fixed and photos have their own tab).
 */
export function OwnerInfoForm({ restaurant }: { restaurant: OwnerRestaurant }) {
  const { toast } = useToast();
  const updateInfo = useMutation(api.owner.updateInfo);
  const categories = useQuery(api.taxonomy.listCategories);
  const cuisines = useQuery(api.taxonomy.listCuisines);

  const [nameAr, setNameAr] = useState(restaurant.nameAr);
  const [nameEn, setNameEn] = useState(restaurant.nameEn ?? "");
  const [descriptionAr, setDescriptionAr] = useState(
    restaurant.descriptionAr ?? "",
  );
  const [priceTier, setPriceTier] = useState<PriceTier>(restaurant.priceTier);
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(restaurant.whatsapp ?? "");
  const [instagram, setInstagram] = useState(restaurant.instagram ?? "");
  const [website, setWebsite] = useState(restaurant.website ?? "");
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [categorySlugs, setCategorySlugs] = useState<string[]>(
    restaurant.categorySlugs,
  );
  const [cuisineSlugs, setCuisineSlugs] = useState<string[]>(
    restaurant.cuisineSlugs,
  );
  const [hours, setHours] = useState<HourRow[]>(() => buildWeek(restaurant.hours));
  const [busy, setBusy] = useState(false);

  const selectedCategoryNames =
    categories
      ?.filter((c) => categorySlugs.includes(c.slug))
      .map((c) => c.nameAr) ?? [];

  const hasName = nameAr.trim() !== "";
  const hasCategory = categorySlugs.length > 0;
  const canSave = hasName && hasCategory;

  function toggle(list: string[], slug: string): string[] {
    return list.includes(slug)
      ? list.filter((s) => s !== slug)
      : [...list, slug];
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!nameAr.trim()) {
      toast({ title: "اسم المطعم مطلوب", variant: "error" });
      return;
    }
    if (categorySlugs.length === 0) {
      toast({ title: "اختر تصنيفاً واحداً على الأقل", variant: "error" });
      return;
    }

    setBusy(true);
    try {
      await updateInfo({
        restaurantId: restaurant.id,
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim() || undefined,
        descriptionAr: descriptionAr.trim() || undefined,
        priceTier,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        instagram: instagram.trim() || undefined,
        website: website.trim() || undefined,
        address: address.trim() || undefined,
        hours: hours.map((row) =>
          row.closed
            ? { day: row.day, closed: true }
            : {
                day: row.day,
                open: row.open || undefined,
                close: row.close || undefined,
              },
        ),
        categorySlugs,
        cuisineSlugs,
      });
      toast({ title: "تم الحفظ", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="md:grid md:grid-cols-[1fr_20rem] md:items-start md:gap-6"
    >
      {/* Form column (DOM-first → right in RTL on desktop, top on mobile). */}
      <div className="flex flex-col gap-6">
        <Section step={1} title="الاسم">
          <label className={labelClass}>
            <span>
              اسم المطعم (بالعربية)
              <Required />
            </span>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className={inputClass}
              placeholder="مثال: مطعم الشام"
            />
          </label>
          <label className={labelClass}>
            <span>
              الاسم بالإنجليزية <span className={hintClass}>(اختياري)</span>
            </span>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className={inputClass}
              dir="ltr"
              placeholder="Al Sham Restaurant"
            />
          </label>
        </Section>

        <Section step={2} title="شو بيقدّم؟">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium text-ink">
              التصنيفات
              <Required />
            </legend>
            <CategoryGrid
              categories={categories}
              selected={categorySlugs}
              onToggle={(slug) => setCategorySlugs((prev) => toggle(prev, slug))}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium text-ink">
              المطابخ <span className={hintClass}>(اختياري)</span>
            </legend>
            <ChipSelect
              options={cuisines}
              selected={cuisineSlugs}
              onToggle={(slug) => setCuisineSlugs((prev) => toggle(prev, slug))}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium text-ink">
              مستوى السعر
            </legend>
            <PriceTierGrid value={priceTier} onChange={setPriceTier} />
          </fieldset>
        </Section>

        <Section
          step={3}
          title={<>التواصل والعنوان <span className={hintClass}>(اختياري)</span></>}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ContactInput
              label="الهاتف"
              icon="call"
              value={phone}
              onChange={setPhone}
              dir="ltr"
              inputMode="tel"
              placeholder="+963…"
            />
            <ContactInput
              label="واتساب"
              icon="chat"
              value={whatsapp}
              onChange={setWhatsapp}
              dir="ltr"
              inputMode="tel"
              placeholder="+963…"
            />
            <ContactInput
              label="إنستغرام"
              icon="photo_camera"
              value={instagram}
              onChange={setInstagram}
              dir="ltr"
              placeholder="@username"
            />
            <ContactInput
              label="الموقع الإلكتروني"
              icon="language"
              value={website}
              onChange={setWebsite}
              dir="ltr"
              inputMode="url"
              placeholder="https://…"
            />
          </div>
          <label className={labelClass}>
            <span>العنوان</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
              placeholder="الشارع، بجانب…"
            />
          </label>
        </Section>

        <Section step={4} title="أوقات العمل">
          <HoursEditor value={hours} onChange={setHours} />
        </Section>

        <Section
          step={5}
          title={<>نبذة <span className={hintClass}>(اختياري)</span></>}
        >
          <textarea
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="عرّف بالمطعم وأجوائه وأطباقه المميزة…"
          />
        </Section>
      </div>

      {/* Preview / checklist sidebar (bottom on mobile, sticky-left on desktop). */}
      <aside className="mt-6 md:mt-0 md:sticky md:top-20">
        <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
          <span className="text-xs font-medium text-ink-muted">معاينة</span>

          <div className="flex flex-col gap-1">
            <p
              className={`font-heading text-2xl font-black leading-tight ${
                hasName ? "text-ink" : "text-ink-muted"
              }`}
            >
              {nameAr.trim() || "اسم المطعم"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedCategoryNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center rounded-pill bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink"
                >
                  {name}
                </span>
              ))}
              <span className="inline-flex items-center rounded-pill bg-surface-muted px-2.5 py-0.5 text-xs font-bold text-accent-600">
                {"$".repeat(priceTier)}
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-2 border-t border-line pt-4">
            <ChecklistRow ok={hasName} label="الاسم بالعربية" />
            <ChecklistRow ok={hasCategory} label="تصنيف واحد على الأقل" />
          </ul>

          <button
            type="submit"
            disabled={busy || !canSave}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill bg-brand-500 px-6 py-3 font-bold text-on-accent transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "جارٍ الحفظ…" : "حفظ التغييرات"}
            {!busy && (
              <span aria-hidden className="ms">
                check
              </span>
            )}
          </button>

          <p className={`${hintClass} text-center`}>
            تُحفظ التغييرات فوراً على صفحة مطعمك.
          </p>
        </div>
      </aside>
    </form>
  );
}
