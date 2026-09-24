"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { getErrorMessage } from "@/lib/errors";
import { inputClass, labelClass, hintClass } from "@/lib/ui";
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

type Editable = {
  id: Id<"restaurants">;
  status: "pending" | "published" | "rejected" | "closed";
  moderationNote: string | null;
  coverKey: string | null;
  photoKeys: string[];
  coverUrl: string | null;
  photoUrls: string[];
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
 * Loads an editable submission the viewer proposed and renders it in the same
 * two-pane layout as the add form (numbered sections + preview/checklist
 * sidebar). Published edits go live; pending/rejected re-enter review.
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
      <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-5xl">
          🚫
        </span>
        <h2 className="font-heading text-xl font-black text-ink">
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
  const generateUploadUrl = useMutation(api.submissions.generateUploadUrl);
  const attachPhotos = useMutation(api.submissions.attachPhotos);

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
  const [keptPhotos, setKeptPhotos] = useState(() => [
    ...(editable.coverKey && editable.coverUrl
      ? [{ key: editable.coverKey, url: editable.coverUrl }]
      : []),
    ...editable.photoKeys.map((k, i) => ({
      key: k,
      url: editable.photoUrls[i] ?? "",
    })),
  ]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const isPublished = editable.status === "published";
  const selectedCity = cities?.find((c) => c.slug === citySlug) ?? null;
  const neighborhoods = useQuery(
    api.taxonomy.listNeighborhoods,
    selectedCity ? { cityId: selectedCity.id } : "skip",
  );
  const selectedCategoryNames =
    categories
      ?.filter((c) => categorySlugs.includes(c.slug))
      .map((c) => c.nameAr) ?? [];

  // Checklist gates the save button (mirrors the add form).
  const hasName = nameAr.trim() !== "";
  const hasCity = !!selectedCity;
  const hasCategory = categorySlugs.length > 0;
  const canSave = hasName && hasCity && hasCategory;

  function toggle(list: string[], slug: string): string[] {
    return list.includes(slug)
      ? list.filter((s) => s !== slug)
      : [...list, slug];
  }

  /** Upload newly-picked photos into restaurants/<id>/…; returns their keys. */
  async function uploadPhotos(): Promise<string[]> {
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

      // Sync photos: upload new ones, keep the rest; first image = cover.
      const uploaded = await uploadPhotos();
      const finalKeys = keptPhotos.map((p) => p.key).concat(uploaded);
      await attachPhotos({
        restaurantId,
        coverKey: finalKeys[0],
        photoKeys: finalKeys.slice(1),
      });

      toast({
        title: isPublished ? "تم حفظ التعديلات" : "تم إرسال التعديلات للمراجعة",
        variant: "success",
      });
      router.push("/submissions");
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
        {editable.status === "rejected" && editable.moderationNote && (
          <p className="rounded-card border border-red-500/20 bg-red-500/10 p-4 text-sm leading-relaxed text-red-600">
            سبب الرفض: {editable.moderationNote}
          </p>
        )}

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
              value={citySlug}
              onChange={(e) => {
                setCitySlug(e.target.value);
                setNeighborhoodSlug("");
              }}
              className={`${inputClass} cursor-pointer`}
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
            <span>
              الحي <span className={hintClass}>(اختياري)</span>
            </span>
            <select
              value={neighborhoodSlug}
              onChange={(e) => setNeighborhoodSlug(e.target.value)}
              disabled={!selectedCity}
              className={`${inputClass} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
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

        <Section
          step={4}
          title={<>التواصل <span className={hintClass}>(اختياري)</span></>}
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
        </Section>

        <Section
          step={5}
          title={<>الصور <span className={hintClass}>(اختياري)</span></>}
        >
          <PhotoPicker
            existing={keptPhotos}
            files={photoFiles}
            max={6}
            hint="أول صورة تكون الغلاف. الصور الجديدة تُرفع عند الحفظ."
            onRemoveExisting={(key) =>
              setKeptPhotos((prev) => prev.filter((p) => p.key !== key))
            }
            onAddFiles={(added) => setPhotoFiles((prev) => [...prev, ...added])}
            onRemoveFile={(index) =>
              setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
            }
          />
        </Section>

        <Section
          step={6}
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

          <button
            type="submit"
            disabled={busy || !canSave}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill bg-brand-500 px-6 py-3 font-bold text-on-accent transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy
              ? "جارٍ الحفظ…"
              : isPublished
                ? "حفظ التغييرات"
                : "إرسال التعديلات للمراجعة"}
            {!busy && (
              <span aria-hidden className="ms">
                {isPublished ? "check" : "arrow_back"}
              </span>
            )}
          </button>

          <p className={`${hintClass} text-center`}>
            {isPublished
              ? "التعديلات تُنشر مباشرةً على صفحة المطعم."
              : "نراجع التعديلات قبل نشرها، عادةً خلال يوم."}
          </p>
        </div>
      </aside>
    </form>
  );
}
