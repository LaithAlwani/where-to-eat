"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { RestaurantEditForm } from "./RestaurantEditForm";

/**
 * Loads an editable submission the viewer proposed and renders it in the shared
 * two-pane form. Published edits go live; pending/rejected re-enter review.
 */
export function SubmissionEditForm({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const editable = useQuery(api.submissions.getMineForEdit, { restaurantId });
  const resubmit = useMutation(api.submissions.resubmit);

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

  const isPublished = editable.status === "published";

  return (
    <RestaurantEditForm
      restaurantId={restaurantId}
      editable={editable}
      onSaveFields={(values) => resubmit({ restaurantId, ...values })}
      redirectTo="/submissions"
      successTitle={
        isPublished ? "تم حفظ التعديلات" : "تم إرسال التعديلات للمراجعة"
      }
      submitLabel={isPublished ? "حفظ التغييرات" : "إرسال التعديلات للمراجعة"}
      submitIcon={isPublished ? "check" : "arrow_back"}
      footerNote={
        isPublished
          ? "التعديلات تُنشر مباشرةً على صفحة المطعم."
          : "نراجع التعديلات قبل نشرها، عادةً خلال يوم."
      }
    />
  );
}
