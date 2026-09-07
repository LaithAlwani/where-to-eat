"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { OwnerRestaurant } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import { primaryBtnClass } from "@/lib/ui";
import { useToast } from "./ui/ToastProvider";
import { PhotoUploader } from "./PhotoUploader";
import { CoverImage } from "./CoverImage";

/** Owner editor tab: cover image + gallery. Saves keys via owner.setPhotos. */
export function OwnerPhotos({ restaurant }: { restaurant: OwnerRestaurant }) {
  const { toast } = useToast();
  const setPhotos = useMutation(api.owner.setPhotos);

  const [coverKeys, setCoverKeys] = useState<string[]>(
    restaurant.coverKey ? [restaurant.coverKey] : [],
  );
  const [photoKeys, setPhotoKeys] = useState<string[]>(restaurant.photoKeys);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await setPhotos({
        restaurantId: restaurant.id,
        coverKey: coverKeys[0],
        photoKeys,
      });
      toast({ title: "تم الحفظ", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-ink">صورة الغلاف</h3>
        {restaurant.coverUrl && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">الحالية</span>
            <CoverImage
              url={restaurant.coverUrl}
              nameAr={restaurant.nameAr}
              className="h-32 w-full max-w-xs"
            />
          </div>
        )}
        <PhotoUploader value={coverKeys} onChange={setCoverKeys} max={1} />
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-ink">معرض الصور</h3>
        {restaurant.photoUrls.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">الحالية</span>
            <div className="flex flex-wrap gap-2">
              {restaurant.photoUrls.map((url) => (
                <div
                  key={url}
                  className="relative h-20 w-20 overflow-hidden rounded-card bg-surface-muted ring-1 ring-ink/10"
                >
                  <Image
                    src={url}
                    alt={restaurant.nameAr}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <PhotoUploader value={photoKeys} onChange={setPhotoKeys} max={8} />
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className={primaryBtnClass}
        >
          {busy ? "جارٍ الحفظ…" : "حفظ"}
        </button>
      </div>
    </div>
  );
}
