"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { getErrorMessage } from "@/lib/errors";
import { inputClass, labelClass, hintClass, primaryBtnClass } from "@/lib/ui";
import { useToast } from "./ui/ToastProvider";
import { ChipSelect } from "./ChipSelect";
import { PhotoPicker } from "./PhotoPicker";
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
 * Auth-gated form to submit a new restaurant for review. On success shows a
 * confirmation panel (the restaurant is pending, so its public page is hidden
 * until an admin approves it).
 */
export function RestaurantSubmitForm() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { toast } = useToast();
  const submit = useMutation(api.submissions.submit);
  const generateUploadUrl = useMutation(api.submissions.generateUploadUrl);
  const attachPhotos = useMutation(api.submissions.attachPhotos);

  const cities = useQuery(api.taxonomy.listCities);
  const categories = useQuery(api.taxonomy.listCategories);
  const cuisines = useQuery(api.taxonomy.listCuisines);

  // Prefill the name from a contextual "add it" search link (/submit?name=…).
  const searchParams = useSearchParams();
  const [nameAr, setNameAr] = useState(() => searchParams.get("name") ?? "");
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
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [claimOwnership, setClaimOwnership] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ claimFiled: boolean } | null>(null);

  const neighborhoods = useQuery(
    api.taxonomy.listNeighborhoods,
    cityId ? { cityId } : "skip",
  );

  const selectedCity = cities?.find((c) => c.id === cityId) ?? null;
  const selectedCategoryNames =
    categories?.filter((c) => categorySlugs.includes(c.slug)).map((c) => c.nameAr) ??
    [];

  // Checklist gates the submit button.
  const hasName = nameAr.trim() !== "";
  const hasCity = !!selectedCity;
  const hasCategory = categorySlugs.length > 0;
  const canSubmit = hasName && hasCity && hasCategory;

  function toggle(list: string[], slug: string): string[] {
    return list.includes(slug)
      ? list.filter((s) => s !== slug)
      : [...list, slug];
  }

  /** Upload the picked photos into restaurants/<id>/…; returns the stored keys. */
  async function uploadPhotos(restaurantId: Id<"restaurants">): Promise<string[]> {
    const keys: string[] = [];
    for (const file of photoFiles) {
      try {
        const key = `restaurants/${restaurantId}/${crypto.randomUUID()}`;
        const { url } = await generateUploadUrl({ restaurantId, key });
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("upload failed");
        keys.push(key);
      } catch {
        toast({ title: "تعذّر رفع إحدى الصور", variant: "error" });
      }
    }
    return keys;
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
        claimOwnership,
      });

      // Photos upload AFTER the restaurant exists (into restaurants/<id>/…);
      // first image becomes the cover, the rest the gallery.
      if (photoFiles.length > 0) {
        const keys = await uploadPhotos(result.id);
        if (keys.length > 0) {
          await attachPhotos({
            restaurantId: result.id,
            coverKey: keys[0],
            photoKeys: keys.slice(1),
          });
        }
      }

      toast({ title: "تم إرسال المطعم للمراجعة", variant: "success" });
      setDone({ claimFiled: result.claimFiled });
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
      <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-5xl">
          🔐
        </span>
        <h2 className="font-heading text-xl font-black text-ink">
          سجّل الدخول لإضافة مطعم
        </h2>
        <p className="text-ink-muted">
          أنشئ حساباً أو سجّل الدخول من زر «الحساب» في الأعلى للمتابعة.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-line bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-5xl">
          🎉
        </span>
        <h2 className="font-heading text-xl font-black text-ink">
          شكراً! سيظهر المطعم بعد مراجعته.
        </h2>
        <p className="max-w-md text-ink-muted">
          {done.claimFiled
            ? "سجّلنا طلبك مع طلب ملكية المكان — سنراجعهما وننشرهما قريباً. تابع الحالة من لوحة التحكم."
            : "راجعنا طلبك وسننشره قريباً. يمكنك متابعة حالة مطاعمك من لوحة التحكم."}
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
              setPhotoFiles([]);
              setPhone("");
              setWhatsapp("");
              setInstagram("");
              setWebsite("");
              setClaimOwnership(false);
            }}
            className="cursor-pointer rounded-pill border border-line-2 px-6 py-2 font-medium text-ink transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            إضافة مطعم آخر
          </button>
        </div>
      </div>
    );
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

        <Section step={2} title="الموقع">
          <label className={labelClass}>
            <span>
              المدينة
              <Required />
            </span>
            <select
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value as Id<"cities">);
                setNeighborhoodSlug("");
              }}
              className={`${inputClass} cursor-pointer`}
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
            <span>
              الحي <span className={hintClass}>(اختياري)</span>
            </span>
            <select
              value={neighborhoodSlug}
              onChange={(e) => setNeighborhoodSlug(e.target.value)}
              disabled={!cityId}
              className={`${inputClass} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
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
          <label className={labelClass}>
            <span>
              العنوان <span className={hintClass}>(اختياري)</span>
            </span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
              placeholder="الشارع، بجانب…"
            />
          </label>
        </Section>

        <Section step={3} title="شو بيقدّم؟">
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

        <Section step={4} title={<>التواصل <span className={hintClass}>(اختياري)</span></>}>
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
        </Section>

        <Section step={5} title={<>الصور <span className={hintClass}>(اختياري)</span></>}>
          <PhotoPicker
            existing={[]}
            files={photoFiles}
            max={6}
            hint="أضف صور المطعم — أول صورة تكون الغلاف. تُرفع بعد الإرسال."
            onRemoveExisting={() => {}}
            onAddFiles={(added) => setPhotoFiles((prev) => [...prev, ...added])}
            onRemoveFile={(index) =>
              setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
            }
          />
        </Section>

        <Section step={6} title={<>نبذة <span className={hintClass}>(اختياري)</span></>}>
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
            <p
              className={`text-sm ${selectedCity ? "text-ink-muted" : "text-ink-muted/60"}`}
            >
              {selectedCity?.nameAr ?? "المدينة"}
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
            <ChecklistRow ok={hasCity} label="المدينة" />
            <ChecklistRow ok={hasCategory} label="تصنيف واحد على الأقل" />
          </ul>

          <label className="flex cursor-pointer items-start gap-3 border-t border-line pt-4">
            <input
              type="checkbox"
              checked={claimOwnership}
              onChange={(e) => setClaimOwnership(e.target.checked)}
              className="mt-1 size-4 cursor-pointer accent-brand-500"
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-ink">
                أنا مالك هذا المكان
              </span>
              <span className={hintClass}>
                سيتم إرسال طلب ملكية للمراجعة حتى تتمكن من إدارة الصفحة.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={busy || !canSubmit}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill bg-brand-500 px-6 py-3 font-bold text-on-accent transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "جارٍ الإرسال…" : "أرسل للمراجعة"}
            {!busy && (
              <span aria-hidden className="ms">
                arrow_back
              </span>
            )}
          </button>

          <p className={`${hintClass} text-center`}>
            نراجع كل مطعم قبل ما ينشر، عادةً خلال يوم.
          </p>
        </div>
      </aside>
    </form>
  );
}
