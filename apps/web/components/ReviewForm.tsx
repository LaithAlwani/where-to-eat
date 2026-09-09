"use client";

import { useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { StarInput } from "./StarInput";
import { PhotoPicker } from "./PhotoPicker";
import { useToast } from "./ui/ToastProvider";
import { getErrorMessage } from "@/lib/errors";

type Existing = {
  id: Id<"reviews">;
  rating: number;
  body: string | null;
  photoKeys: string[];
  photoUrls: string[];
};

type ReviewFormProps = {
  restaurantId: Id<"restaurants">;
  existing?: Existing | null;
  onDone?: () => void;
};

function zipPhotos(keys: string[], urls: string[]) {
  return keys.map((key, i) => ({ key, url: urls[i] ?? "" }));
}

/**
 * Create/edit a review: stars + body + photos. Photos are uploaded to R2 only
 * AFTER the review is saved (into a reviews/<reviewId>/ folder), so nothing is
 * stored until the review exists. Requires auth; errors surface via toast.
 */
export function ReviewForm({ restaurantId, existing, onDone }: ReviewFormProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { toast } = useToast();
  const createReview = useMutation(api.reviews.create);
  const updateReview = useMutation(api.reviews.update);
  const generateUploadUrl = useMutation(api.reviews.generateUploadUrl);
  const attachPhotos = useMutation(api.reviews.attachPhotos);

  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [body, setBody] = useState(existing?.body ?? "");
  const [keptExisting, setKeptExisting] = useState(
    existing ? zipPhotos(existing.photoKeys, existing.photoUrls) : [],
  );
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  if (isLoading) return <p className="text-ink-muted">جارٍ التحميل…</p>;

  if (!isAuthenticated) {
    return (
      <div className="rounded-card bg-surface-muted px-4 py-6 text-center text-ink-muted">
        سجّل الدخول لكتابة تقييم
      </div>
    );
  }

  async function uploadFiles(reviewId: Id<"reviews">): Promise<string[]> {
    const keys: string[] = [];
    for (const file of files) {
      try {
        const key = `reviews/${reviewId}/${crypto.randomUUID()}`;
        const { url } = await generateUploadUrl({ reviewId, key });
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

  async function submit() {
    if (rating < 1) {
      toast({ title: "اختر عدد النجوم أولاً", variant: "error" });
      return;
    }
    setBusy(true);
    try {
      const trimmed = body.trim();
      let reviewId: Id<"reviews">;
      if (existing) {
        await updateReview({
          reviewId: existing.id,
          rating,
          body: trimmed || undefined,
        });
        reviewId = existing.id;
      } else {
        reviewId = await createReview({
          restaurantId,
          rating,
          body: trimmed || undefined,
        });
      }

      const uploadedKeys = await uploadFiles(reviewId);
      const finalKeys = keptExisting.map((p) => p.key).concat(uploadedKeys);
      if (existing || uploadedKeys.length > 0) {
        await attachPhotos({ reviewId, photoKeys: finalKeys });
      }

      toast({ title: "تم نشر تقييمك", variant: "success" });
      onDone?.();
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink">تقييمك</span>
        <StarInput value={rating} onChange={setRating} size="lg" />
      </div>

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="اكتب تجربتك…"
        rows={4}
        className="w-full rounded-card border border-ink/10 bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none"
      />

      <PhotoPicker
        existing={keptExisting}
        files={files}
        hint="حتى ٦ صور، بحجم أقصى ٨ ميغابايت لكل صورة — تُرفع بعد نشر التقييم"
        onRemoveExisting={(key) =>
          setKeptExisting((prev) => prev.filter((p) => p.key !== key))
        }
        onAddFiles={(added) => setFiles((prev) => [...prev, ...added])}
        onRemoveFile={(index) =>
          setFiles((prev) => prev.filter((_, i) => i !== index))
        }
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="rounded-pill bg-brand-500 px-6 py-2 font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {busy ? "جارٍ النشر…" : existing ? "حفظ التعديل" : "نشر التقييم"}
        </button>
      </div>
    </div>
  );
}
