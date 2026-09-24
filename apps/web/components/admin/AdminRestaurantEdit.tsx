"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { RestaurantEditForm } from "../RestaurantEditForm";

/**
 * Admin edit for any restaurant, reusing the shared two-pane form. Gating is
 * enforced server-side: admin.getRestaurant / admin.updateRestaurant both
 * requireAdmin, so a non-admin sees the "admins only" state and can't save.
 */
export function AdminRestaurantEdit({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const editable = useQuery(api.admin.getRestaurant, { restaurantId });
  const updateRestaurant = useMutation(api.admin.updateRestaurant);

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
          🔒
        </span>
        <h2 className="font-heading text-xl font-black text-ink">
          تعذّر فتح هذا المطعم
        </h2>
        <p className="text-ink-muted">
          قد يكون المطعم غير موجود أو لا تملك صلاحية الإدارة.
        </p>
        <Link
          href="/admin"
          className="rounded-pill bg-brand-500 px-6 py-2 font-medium text-on-accent transition hover:bg-brand-600"
        >
          العودة للوحة الإدارة
        </Link>
      </div>
    );
  }

  return (
    <RestaurantEditForm
      restaurantId={restaurantId}
      editable={editable}
      onSaveFields={(values) => updateRestaurant({ restaurantId, ...values })}
      redirectTo="/admin"
      successTitle="تم حفظ التغييرات"
      submitLabel="حفظ التغييرات"
      submitIcon="check"
      footerNote="التعديلات تُحفظ فوراً دون تغيير حالة النشر."
    />
  );
}
