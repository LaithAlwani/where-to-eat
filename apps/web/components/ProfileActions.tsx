"use client";

import { useState } from "react";
import type { Id } from "@repo/backend/dataModel";
import { useToast } from "./ui/ToastProvider";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { FavoriteButton } from "./FavoriteButton";

type ProfileActionsProps = {
  restaurantId: Id<"restaurants">;
  nameAr: string;
  phone: string | null;
  geo: { lat: number; lng: number } | null;
};

/**
 * Primary actions row for a restaurant profile. Share uses navigator.share when
 * available, else copies the link and confirms via a toast (never alert). Save
 * toggles the favorite; "تقييم" jumps to the reviews section anchor. A "report"
 * flow demonstrates the ConfirmDialog primitive.
 */
export function ProfileActions({
  restaurantId,
  nameAr,
  phone,
  geo,
}: ProfileActionsProps) {
  const { toast } = useToast();
  const [reportOpen, setReportOpen] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: nameAr, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "تم نسخ الرابط", variant: "success" });
    } catch {
      toast({ title: "تعذّر نسخ الرابط", variant: "error" });
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-1.5 rounded-pill bg-brand-500 px-5 py-2 font-medium text-white transition hover:bg-brand-600"
        >
          <span aria-hidden>📞</span> اتصال
        </a>
      )}

      {geo ? (
        <a
          href={`https://maps.google.com/?q=${geo.lat},${geo.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-pill bg-accent-500 px-5 py-2 font-medium text-white transition hover:bg-accent-600"
        >
          <span aria-hidden>📍</span> الموقع
        </a>
      ) : (
        <a
          href="#location"
          className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-5 py-2 font-medium text-ink ring-1 ring-ink/10 transition hover:bg-surface-muted"
        >
          <span aria-hidden>📍</span> الموقع
        </a>
      )}

      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-5 py-2 font-medium text-ink ring-1 ring-ink/10 transition hover:bg-surface-muted"
      >
        <span aria-hidden>↗</span> مشاركة
      </button>

      <FavoriteButton restaurantId={restaurantId} />

      <a
        href="#reviews"
        className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-5 py-2 font-medium text-ink ring-1 ring-ink/10 transition hover:bg-surface-muted"
      >
        <span aria-hidden>⭐</span> تقييم
      </a>

      <button
        type="button"
        onClick={() => setReportOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-pill px-5 py-2 font-medium text-ink-muted transition hover:text-ink"
      >
        <span aria-hidden>🚩</span> إبلاغ عن خطأ
      </button>

      <ConfirmDialog
        open={reportOpen}
        title="الإبلاغ عن خطأ"
        description="هل تريد إعلامنا بوجود معلومة غير صحيحة في هذه الصفحة؟"
        confirmLabel="إرسال"
        onConfirm={() => {
          toast({ title: "شكراً لك، تم استلام ملاحظتك", variant: "success" });
        }}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
