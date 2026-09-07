"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { OwnerRestaurant } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import {
  inputClass,
  primaryBtnClass,
  secondaryBtnClass,
  ghostBtnClass,
} from "@/lib/ui";
import { useToast } from "./ui/ToastProvider";

const CURRENCIES = ["SYP", "USD", "TRY", "EUR"] as const;

type ItemDraft = {
  nameAr: string;
  nameEn: string;
  price: string;
  currency: string;
  descriptionAr: string;
};

type SectionDraft = {
  nameAr: string;
  nameEn: string;
  items: ItemDraft[];
};

function seedDrafts(menu: OwnerRestaurant["menu"]): SectionDraft[] {
  if (!menu) return [];
  return menu.map((section) => ({
    nameAr: section.nameAr,
    nameEn: section.nameEn ?? "",
    items: section.items.map((item) => ({
      nameAr: item.nameAr,
      nameEn: item.nameEn ?? "",
      price: item.price != null ? String(item.price) : "",
      currency: item.currency ?? "SYP",
      descriptionAr: item.descriptionAr ?? "",
    })),
  }));
}

function emptyItem(): ItemDraft {
  return { nameAr: "", nameEn: "", price: "", currency: "SYP", descriptionAr: "" };
}

/** Owner editor tab: edit menu sections and their items, saved via updateMenu. */
export function MenuEditor({ restaurant }: { restaurant: OwnerRestaurant }) {
  const { toast } = useToast();
  const updateMenu = useMutation(api.owner.updateMenu);
  const [sections, setSections] = useState<SectionDraft[]>(() =>
    seedDrafts(restaurant.menu),
  );
  const [busy, setBusy] = useState(false);

  function updateSection(index: number, patch: Partial<SectionDraft>) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  }

  function updateItem(si: number, ii: number, patch: Partial<ItemDraft>) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === si
          ? {
              ...s,
              items: s.items.map((it, j) =>
                j === ii ? { ...it, ...patch } : it,
              ),
            }
          : s,
      ),
    );
  }

  async function save() {
    // Drop rows with no Arabic name; the backend requires it.
    const cleaned = sections
      .map((s) => ({
        nameAr: s.nameAr.trim(),
        nameEn: s.nameEn.trim() || undefined,
        items: s.items
          .filter((it) => it.nameAr.trim())
          .map((it) => {
            const priceNum = it.price.trim() ? Number(it.price) : undefined;
            return {
              nameAr: it.nameAr.trim(),
              nameEn: it.nameEn.trim() || undefined,
              price:
                priceNum != null && Number.isFinite(priceNum)
                  ? priceNum
                  : undefined,
              currency: it.currency || "SYP",
              descriptionAr: it.descriptionAr.trim() || undefined,
            };
          }),
      }))
      .filter((s) => s.nameAr);

    setBusy(true);
    try {
      await updateMenu({ restaurantId: restaurant.id, sections: cleaned });
      toast({ title: "تم الحفظ", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {sections.length === 0 && (
        <p className="rounded-card bg-surface-muted px-4 py-8 text-center text-ink-muted">
          لا توجد أقسام بعد — أضف أول قسم في قائمتك.
        </p>
      )}

      {sections.map((section, si) => (
        <div
          key={si}
          className="flex flex-col gap-4 rounded-card bg-surface p-4 ring-1 ring-ink/5"
        >
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-ink">
              اسم القسم (بالعربية)
              <input
                value={section.nameAr}
                onChange={(e) => updateSection(si, { nameAr: e.target.value })}
                className={inputClass}
                placeholder="مثال: المقبّلات"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-ink">
              بالإنجليزية (اختياري)
              <input
                value={section.nameEn}
                onChange={(e) => updateSection(si, { nameEn: e.target.value })}
                className={inputClass}
                dir="ltr"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                setSections((prev) => prev.filter((_, i) => i !== si))
              }
              className={ghostBtnClass}
            >
              حذف القسم
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {section.items.map((item, ii) => (
              <div
                key={ii}
                className="flex flex-col gap-2 rounded-card bg-surface-muted p-3"
              >
                <div className="flex flex-wrap gap-2">
                  <input
                    value={item.nameAr}
                    onChange={(e) =>
                      updateItem(si, ii, { nameAr: e.target.value })
                    }
                    className={`${inputClass} flex-1`}
                    placeholder="اسم الطبق"
                  />
                  <input
                    value={item.nameEn}
                    onChange={(e) =>
                      updateItem(si, ii, { nameEn: e.target.value })
                    }
                    className={`${inputClass} flex-1`}
                    dir="ltr"
                    placeholder="Dish name"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={item.price}
                    onChange={(e) =>
                      updateItem(si, ii, { price: e.target.value })
                    }
                    className={`${inputClass} w-32`}
                    inputMode="numeric"
                    placeholder="السعر"
                  />
                  <select
                    value={item.currency}
                    onChange={(e) =>
                      updateItem(si, ii, { currency: e.target.value })
                    }
                    className={`${inputClass} w-28`}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    value={item.descriptionAr}
                    onChange={(e) =>
                      updateItem(si, ii, { descriptionAr: e.target.value })
                    }
                    className={`${inputClass} flex-1`}
                    placeholder="وصف (اختياري)"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      updateSection(si, {
                        items: section.items.filter((_, j) => j !== ii),
                      })
                    }
                    className={ghostBtnClass}
                  >
                    إزالة الطبق
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                updateSection(si, { items: [...section.items, emptyItem()] })
              }
              className={`${secondaryBtnClass} self-start`}
            >
              ＋ إضافة طبق
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            setSections((prev) => [
              ...prev,
              { nameAr: "", nameEn: "", items: [] },
            ])
          }
          className={secondaryBtnClass}
        >
          ＋ إضافة قسم
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className={primaryBtnClass}
        >
          {busy ? "جارٍ الحفظ…" : "حفظ القائمة"}
        </button>
      </div>
    </div>
  );
}
