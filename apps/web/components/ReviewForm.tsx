"use client";

import { useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { StarInput } from "./StarInput";
import { PhotoUploader } from "./PhotoUploader";
import { useToast } from "./ui/ToastProvider";
import { getErrorMessage } from "@/lib/errors";

type Existing = {
  id: Id<"reviews">;
  rating: number;
  body: string | null;
  photoKeys: string[];
};

type ReviewFormProps = {
  restaurantId: Id<"restaurants">;
  existing?: Existing | null;
  onDone?: () => void;
};

/**
 * Create/edit a review: stars + body + photos. Requires auth (renders a gentle
 * sign-in prompt otherwise). Wraps the mutation in try/catch and surfaces mapped
 * Arabic errors via toast.
 */
export function ReviewForm({ restaurantId, existing, onDone }: ReviewFormProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { toast } = useToast();
  const createReview = useMutation(api.reviews.create);
  const updateReview = useMutation(api.reviews.update);

  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [body, setBody] = useState(existing?.body ?? "");
  const [photoKeys, setPhotoKeys] = useState<string[]>(
    existing?.photoKeys ?? [],
  );
  const [busy, setBusy] = useState(false);

  if (isLoading) {
    return <p className="text-ink-muted">جارٍ التحميل…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-card bg-surface-muted px-4 py-6 text-center text-ink-muted">
        سجّل الدخول لكتابة تقييم
      </div>
    );
  }

  async function submit() {
    if (rating < 1) {
      toast({ title: "اختر عدد النجوم أولاً", variant: "error" });
      return;
    }
    setBusy(true);
    try {
      const trimmed = body.trim();
      if (existing) {
        await updateReview({
          reviewId: existing.id,
          rating,
          body: trimmed || undefined,
          photoKeys,
        });
      } else {
        await createReview({
          restaurantId,
          rating,
          body: trimmed || undefined,
          photoKeys,
        });
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

      <PhotoUploader value={photoKeys} onChange={setPhotoKeys} />

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
