"use client";

import { useState, type ReactNode } from "react";
import { slugify } from "@repo/shared/slug";
import { getErrorMessage } from "@/lib/errors";
import { inputClass, labelClass, hintClass, primaryBtnClass } from "@/lib/ui";
import { useToast } from "../ui/ToastProvider";

export type TaxonomyValues = {
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string;
};

type AddTaxonomyFormProps = {
  title: string;
  submitLabel?: string;
  /** Show an emoji icon field (categories). */
  withIcon?: boolean;
  /** Extra control (e.g. a city <select>) rendered above the name fields. */
  leading?: ReactNode;
  /** Block submission until any external `leading` state is valid. */
  canSubmit?: boolean;
  /** Persist the values; throws on failure. Resets `leading` state on success. */
  onSubmit: (values: TaxonomyValues) => Promise<void>;
};

/**
 * Reusable "add taxonomy row" form (city / neighborhood / category / cuisine).
 * Auto-fills the ASCII slug from the English name until the slug is edited by
 * hand, then leaves it alone. First-class busy + error-toast handling.
 */
export function AddTaxonomyForm({
  title,
  submitLabel = "إضافة",
  withIcon = false,
  leading,
  canSubmit = true,
  onSubmit,
}: AddTaxonomyFormProps) {
  const { toast } = useToast();
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [icon, setIcon] = useState("");
  const [busy, setBusy] = useState(false);

  function updateNameEn(value: string) {
    setNameEn(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  const ready =
    canSubmit &&
    nameAr.trim().length > 0 &&
    nameEn.trim().length > 0 &&
    slug.trim().length > 0 &&
    (!withIcon || icon.trim().length > 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    try {
      await onSubmit({
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        slug: slug.trim(),
        icon: icon.trim(),
      });
      toast({ title: "تمت الإضافة", variant: "success" });
      setNameAr("");
      setNameEn("");
      setSlug("");
      setSlugTouched(false);
      setIcon("");
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-card bg-surface p-4 ring-1 ring-ink/5"
    >
      <h3 className="font-bold text-ink">{title}</h3>

      {leading}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          الاسم بالعربية
          <input
            className={inputClass}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
          />
        </label>
        <label className={labelClass}>
          الاسم بالإنجليزية
          <input
            className={inputClass}
            dir="ltr"
            value={nameEn}
            onChange={(e) => updateNameEn(e.target.value)}
          />
        </label>
        <label className={labelClass}>
          المعرّف (slug)
          <input
            className={inputClass}
            dir="ltr"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
          <span className={hintClass}>يُملأ تلقائياً من الاسم الإنجليزي</span>
        </label>
        {withIcon && (
          <label className={labelClass}>
            الأيقونة (إيموجي)
            <input
              className={inputClass}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🍔"
            />
          </label>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!ready || busy}
          className={`${primaryBtnClass} px-5 py-1.5 text-sm`}
        >
          {busy ? "جارٍ…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
