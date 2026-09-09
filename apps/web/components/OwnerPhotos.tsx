"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import type { OwnerRestaurant } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import { primaryBtnClass } from "@/lib/ui";
import { useToast } from "./ui/ToastProvider";
import { PhotoPicker } from "./PhotoPicker";

type Existing = { key: string; url: string };

function zip(keys: string[], urls: string[]): Existing[] {
  return keys.map((key, i) => ({ key, url: urls[i] ?? "" }));
}

/**
 * Owner editor tab: cover + gallery. Files are held locally and uploaded to
 * R2 (into restaurants/<id>/) only on Save; removed/replaced images are deleted
 * from R2 by owner.setPhotos.
 */
export function OwnerPhotos({ restaurant }: { restaurant: OwnerRestaurant }) {
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.owner.generateUploadUrl);
  const setPhotos = useMutation(api.owner.setPhotos);

  // Seeded once from props; the parent remounts this component (via key) when
  // the saved photo set changes, so these re-initialize from resolved URLs.
  const [coverExisting, setCoverExisting] = useState<Existing | null>(
    restaurant.coverKey && restaurant.coverUrl
      ? { key: restaurant.coverKey, url: restaurant.coverUrl }
      : null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryExisting, setGalleryExisting] = useState<Existing[]>(
    zip(restaurant.photoKeys, restaurant.photoUrls),
  );
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  async function uploadFiles(files: File[]): Promise<string[]> {
    const keys: string[] = [];
    for (const file of files) {
      try {
        const key = `restaurants/${restaurant.id}/${crypto.randomUUID()}`;
        const { url } = await generateUploadUrl({
          restaurantId: restaurant.id as Id<"restaurants">,
          key,
        });
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

  async function save() {
    setBusy(true);
    try {
      let coverKey: string | undefined = coverExisting?.key;
      if (coverFile) {
        const [uploaded] = await uploadFiles([coverFile]);
        coverKey = uploaded ?? coverExisting?.key;
      }
      const uploadedGallery = await uploadFiles(galleryFiles);
      const photoKeys = galleryExisting
        .map((p) => p.key)
        .concat(uploadedGallery);

      await setPhotos({
        restaurantId: restaurant.id as Id<"restaurants">,
        coverKey,
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
        <PhotoPicker
          existing={coverExisting ? [coverExisting] : []}
          files={coverFile ? [coverFile] : []}
          max={1}
          hint="صورة غلاف واحدة — تُرفع عند الحفظ"
          onRemoveExisting={() => setCoverExisting(null)}
          onAddFiles={(added) => setCoverFile(added[0] ?? null)}
          onRemoveFile={() => setCoverFile(null)}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-ink">معرض الصور</h3>
        <PhotoPicker
          existing={galleryExisting}
          files={galleryFiles}
          max={8}
          hint="حتى ٨ صور — تُرفع عند الحفظ"
          onRemoveExisting={(key) =>
            setGalleryExisting((prev) => prev.filter((p) => p.key !== key))
          }
          onAddFiles={(added) => setGalleryFiles((prev) => [...prev, ...added])}
          onRemoveFile={(index) =>
            setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
          }
        />
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
