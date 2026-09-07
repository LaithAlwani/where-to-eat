"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { OwnerRestaurant } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import { inputClass, labelClass, hintClass, primaryBtnClass } from "@/lib/ui";
import { useToast } from "./ui/ToastProvider";
import { ChipSelect } from "./ChipSelect";
import { PriceTierInput } from "./PriceTierInput";
import { HoursEditor, buildWeek, type HourRow } from "./HoursEditor";

type PriceTier = 1 | 2 | 3 | 4;

/** Owner editor tab: core restaurant info, taxonomy, price, and hours. */
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          اسم المطعم (بالعربية) *
          <input
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          الاسم بالإنجليزية <span className={hintClass}>(اختياري)</span>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className={inputClass}
            dir="ltr"
          />
        </label>
      </div>

      <label className={labelClass}>
        نبذة <span className={hintClass}>(اختياري)</span>
        <textarea
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          rows={4}
          className={inputClass}
        />
      </label>

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
          />
        </label>
        <label className={labelClass}>
          إنستغرام <span className={hintClass}>(اختياري)</span>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className={inputClass}
            dir="ltr"
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
          />
        </label>
      </div>

      <label className={labelClass}>
        العنوان <span className={hintClass}>(اختياري)</span>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputClass}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">أوقات العمل</legend>
        <HoursEditor value={hours} onChange={setHours} />
      </fieldset>

      <div className="flex justify-end">
        <button type="submit" disabled={busy} className={primaryBtnClass}>
          {busy ? "جارٍ الحفظ…" : "حفظ"}
        </button>
      </div>
    </form>
  );
}
