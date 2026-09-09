"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { getErrorMessage } from "@/lib/errors";
import { inputClass, labelClass, hintClass, primaryBtnClass } from "@/lib/ui";
import { useToast } from "./ui/ToastProvider";
import { ChipSelect } from "./ChipSelect";
import { PriceTierInput } from "./PriceTierInput";

type PriceTier = 1 | 2 | 3 | 4;

type Editable = {
  id: Id<"restaurants">;
  status: "pending" | "published" | "rejected" | "closed";
  moderationNote: string | null;
  nameAr: string;
  nameEn: string | null;
  descriptionAr: string | null;
  priceTier: PriceTier;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  address: string | null;
  citySlug: string | null;
  neighborhoodSlug: string | null;
  categorySlugs: string[];
  cuisineSlugs: string[];
};

/**
 * Loads an editable rejected/pending submission and renders a prefilled form to
 * resubmit it for review. Mirrors the fields + validation of the submit form
 * (minus the ownership checkbox).
 */
export function SubmissionEditForm({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const editable = useQuery(api.submissions.getMineForEdit, { restaurantId });

  if (editable === undefined) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-card bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (editable === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-5xl">
          🚫
        </span>
        <h2 className="text-xl font-bold text-ink">
          لا يمكنك تعديل هذا الطلب
        </h2>
        <p className="text-ink-muted">
          قد يكون الطلب غير موجود أو لا تملك صلاحية تعديله.
        </p>
      </div>
    );
  }

  return <EditForm restaurantId={restaurantId} editable={editable} />;
}

function EditForm({
  restaurantId,
  editable,
}: {
  restaurantId: Id<"restaurants">;
  editable: Editable;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const resubmit = useMutation(api.submissions.resubmit);

  const cities = useQuery(api.taxonomy.listCities);
  const categories = useQuery(api.taxonomy.listCategories);
  const cuisines = useQuery(api.taxonomy.listCuisines);

  const [nameAr, setNameAr] = useState(editable.nameAr);
  const [nameEn, setNameEn] = useState(editable.nameEn ?? "");
  const [citySlug, setCitySlug] = useState(editable.citySlug ?? "");
  const [neighborhoodSlug, setNeighborhoodSlug] = useState(
    editable.neighborhoodSlug ?? "",
  );
  const [categorySlugs, setCategorySlugs] = useState<string[]>(
    editable.categorySlugs,
  );
  const [cuisineSlugs, setCuisineSlugs] = useState<string[]>(
    editable.cuisineSlugs,
  );
  const [priceTier, setPriceTier] = useState<PriceTier>(editable.priceTier);
  const [phone, setPhone] = useState(editable.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(editable.whatsapp ?? "");
  const [instagram, setInstagram] = useState(editable.instagram ?? "");
  const [website, setWebsite] = useState(editable.website ?? "");
  const [descriptionAr, setDescriptionAr] = useState(
    editable.descriptionAr ?? "",
  );
  const [address, setAddress] = useState(editable.address ?? "");
  const [busy, setBusy] = useState(false);

  const selectedCity = cities?.find((c) => c.slug === citySlug) ?? null;
  const neighborhoods = useQuery(
    api.taxonomy.listNeighborhoods,
    selectedCity ? { cityId: selectedCity.id } : "skip",
  );

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
      await resubmit({
        restaurantId,
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
      toast({ title: "تم إرسال التعديلات للمراجعة", variant: "success" });
      router.push("/submissions");
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {editable.moderationNote && (
        <p className="rounded-card bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          سبب الرفض: {editable.moderationNote}
        </p>
      )}

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
            value={citySlug}
            onChange={(e) => {
              setCitySlug(e.target.value);
              setNeighborhoodSlug("");
            }}
            className={inputClass}
          >
            <option value="">اختر المدينة…</option>
            {cities?.map((city) => (
              <option key={city.id} value={city.slug}>
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
            disabled={!selectedCity}
            className={`${inputClass} disabled:opacity-50`}
          >
            <option value="">
              {selectedCity ? "اختر الحي…" : "اختر المدينة أولاً"}
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
          {busy ? "جارٍ الإرسال…" : "إرسال التعديلات للمراجعة"}
        </button>
      </div>
    </form>
  );
}
