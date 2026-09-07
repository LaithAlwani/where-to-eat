"use client";

import { useState } from "react";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { getErrorMessage } from "@/lib/errors";
import { inputClass, labelClass, hintClass, primaryBtnClass } from "@/lib/ui";
import { useToast } from "./ui/ToastProvider";
import { ChipSelect } from "./ChipSelect";
import { PriceTierInput } from "./PriceTierInput";

type PriceTier = 1 | 2 | 3 | 4;

/**
 * Auth-gated form to submit a new restaurant for review. On success shows a
 * confirmation panel (the restaurant is pending, so its public page is hidden
 * until an admin approves it).
 */
export function RestaurantSubmitForm() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { toast } = useToast();
  const submit = useMutation(api.submissions.submit);

  const cities = useQuery(api.taxonomy.listCities);
  const categories = useQuery(api.taxonomy.listCategories);
  const cuisines = useQuery(api.taxonomy.listCuisines);

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [cityId, setCityId] = useState<Id<"cities"> | "">("");
  const [neighborhoodSlug, setNeighborhoodSlug] = useState("");
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [cuisineSlugs, setCuisineSlugs] = useState<string[]>([]);
  const [priceTier, setPriceTier] = useState<PriceTier>(2);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ slug: string } | null>(null);

  const neighborhoods = useQuery(
    api.taxonomy.listNeighborhoods,
    cityId ? { cityId } : "skip",
  );

  const selectedCity = cities?.find((c) => c.id === cityId) ?? null;

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
    if (!selectedCity) {
      toast({ title: "اختر المدينة", variant: "error" });
      return;
    }
    if (categorySlugs.length === 0) {
      toast({ title: "اختر تصنيفاً واحداً على الأقل", variant: "error" });
      return;
    }

    setBusy(true);
    try {
      const result = await submit({
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim() || undefined,
        citySlug: selectedCity.slug,
        neighborhoodSlug: neighborhoodSlug || undefined,
        categorySlugs,
        cuisineSlugs,
        priceTier,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        instagram: instagram.trim() || undefined,
        website: website.trim() || undefined,
        descriptionAr: descriptionAr.trim() || undefined,
        address: address.trim() || undefined,
      });
      toast({ title: "تم إرسال المطعم للمراجعة", variant: "success" });
      setDone({ slug: result.slug });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return <p className="text-ink-muted">جارٍ التحميل…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-5xl">
          🔐
        </span>
        <h2 className="text-xl font-bold text-ink">سجّل الدخول لإضافة مطعم</h2>
        <p className="text-ink-muted">
          أنشئ حساباً أو سجّل الدخول من زر «الحساب» في الأعلى للمتابعة.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-5xl">
          🎉
        </span>
        <h2 className="text-xl font-bold text-ink">
          شكراً! سيظهر المطعم بعد مراجعته.
        </h2>
        <p className="text-ink-muted">
          راجعنا طلبك وسننشره قريباً. يمكنك متابعة حالة مطاعمك من لوحة التحكم.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Link href="/dashboard" className={primaryBtnClass}>
            لوحة التحكم
          </Link>
          <button
            type="button"
            onClick={() => {
              setDone(null);
              setNameAr("");
              setNameEn("");
              setCategorySlugs([]);
              setCuisineSlugs([]);
              setDescriptionAr("");
              setAddress("");
              setPhone("");
              setWhatsapp("");
              setInstagram("");
              setWebsite("");
            }}
            className="rounded-pill border border-ink-muted/30 px-6 py-2 font-medium text-ink transition hover:bg-surface"
          >
            إضافة مطعم آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          اسم المطعم (بالعربية) *
          <input
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className={inputClass}
            placeholder="مثال: مطعم الشام"
          />
        </label>
        <label className={labelClass}>
          الاسم بالإنجليزية <span className={hintClass}>(اختياري)</span>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className={inputClass}
            dir="ltr"
            placeholder="Al Sham Restaurant"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          المدينة *
          <select
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value as Id<"cities">);
              setNeighborhoodSlug("");
            }}
            className={inputClass}
          >
            <option value="">اختر المدينة…</option>
            {cities?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.nameAr}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          الحي <span className={hintClass}>(اختياري)</span>
          <select
            value={neighborhoodSlug}
            onChange={(e) => setNeighborhoodSlug(e.target.value)}
            disabled={!cityId}
            className={`${inputClass} disabled:opacity-50`}
          >
            <option value="">
              {cityId ? "اختر الحي…" : "اختر المدينة أولاً"}
            </option>
            {neighborhoods?.map((n) => (
              <option key={n.id} value={n.slug}>
                {n.nameAr}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">التصنيفات *</legend>
        <ChipSelect
          options={categories}
          selected={categorySlugs}
          onToggle={(slug) => setCategorySlugs((prev) => toggle(prev, slug))}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">
          المطابخ <span className={hintClass}>(اختياري)</span>
        </legend>
        <ChipSelect
          options={cuisines}
          selected={cuisineSlugs}
          onToggle={(slug) => setCuisineSlugs((prev) => toggle(prev, slug))}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">مستوى السعر</legend>
        <PriceTierInput value={priceTier} onChange={setPriceTier} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          الهاتف <span className={hintClass}>(اختياري)</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            dir="ltr"
            inputMode="tel"
            placeholder="+963…"
          />
        </label>
        <label className={labelClass}>
          واتساب <span className={hintClass}>(اختياري)</span>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={inputClass}
            dir="ltr"
            inputMode="tel"
            placeholder="+963…"
          />
        </label>
        <label className={labelClass}>
          إنستغرام <span className={hintClass}>(اختياري)</span>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className={inputClass}
            dir="ltr"
            placeholder="@username"
          />
        </label>
        <label className={labelClass}>
          الموقع الإلكتروني <span className={hintClass}>(اختياري)</span>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={inputClass}
            dir="ltr"
            inputMode="url"
            placeholder="https://…"
          />
        </label>
      </div>

      <label className={labelClass}>
        العنوان <span className={hintClass}>(اختياري)</span>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputClass}
          placeholder="الشارع، بجانب…"
        />
      </label>

      <label className={labelClass}>
        نبذة <span className={hintClass}>(اختياري)</span>
        <textarea
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="عرّف بالمطعم وأجوائه وأطباقه المميزة…"
        />
      </label>

      <div className="flex justify-end">
        <button type="submit" disabled={busy} className={primaryBtnClass}>
          {busy ? "جارٍ الإرسال…" : "إرسال للمراجعة"}
        </button>
      </div>
    </form>
  );
}
