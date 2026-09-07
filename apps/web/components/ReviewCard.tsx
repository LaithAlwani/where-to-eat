"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { REPORT_REASONS, type ReportReason } from "@repo/shared/domain";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { RatingStars } from "./RatingStars";
import { ReviewForm } from "./ReviewForm";
import { Dialog } from "./ui/Dialog";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { useToast } from "./ui/ToastProvider";

const REASON_LABELS: Record<ReportReason, string> = {
  spam: "إزعاج / إعلانات",
  offensive: "محتوى مسيء",
  fake: "تقييم مزيّف",
  wrong_info: "معلومة خاطئة",
  not_relevant: "غير ذي صلة",
  other: "أخرى",
};

type ReviewCardProps = {
  review: Review;
  restaurantId: Id<"restaurants">;
};

/**
 * A single review with author, stars, date, body and photo thumbnails (open
 * larger in a Dialog). Owners get edit/delete; others get a report affordance.
 */
export function ReviewCard({ review, restaurantId }: ReviewCardProps) {
  const { toast } = useToast();
  const removeReview = useMutation(api.reviews.remove);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  async function handleDelete() {
    try {
      await removeReview({ reviewId: review.id });
      toast({ title: "تم حذف تقييمك", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    }
  }

  return (
    <article className="flex flex-col gap-3 rounded-card bg-surface p-4 ring-1 ring-ink/5">
      <header className="flex items-center gap-3">
        <Avatar url={review.authorAvatarUrl} name={review.authorName} />
        <div className="flex flex-col">
          <span className="font-medium text-ink">{review.authorName}</span>
          <span className="text-xs text-ink-muted">
            {formatDate(review.createdAt)}
            {review.editedAt && " · معدّل"}
          </span>
        </div>
        <div className="ms-auto">
          <RatingStars value={review.rating} size="sm" />
        </div>
      </header>

      {review.body && <p className="leading-relaxed text-ink">{review.body}</p>}

      {review.photoUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.photoUrls.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => setLightbox(url)}
              className="relative h-20 w-20 overflow-hidden rounded-card bg-surface-muted ring-1 ring-ink/10"
            >
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <footer className="flex items-center gap-3 text-sm">
        {review.isMine ? (
          <>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="font-medium text-brand-600 transition hover:text-brand-700"
            >
              تعديل
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="font-medium text-ink-muted transition hover:text-ink"
            >
              حذف
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="text-ink-muted transition hover:text-ink"
          >
            🚩 إبلاغ
          </button>
        )}
      </footer>

      {/* Edit — seed from getMine so existing photos aren't dropped. */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="تعديل التقييم">
        {editOpen && (
          <EditMyReview
            restaurantId={restaurantId}
            onDone={() => setEditOpen(false)}
          />
        )}
      </Dialog>

      {/* Delete */}
      <ConfirmDialog
        open={confirmOpen}
        title="حذف التقييم"
        description="هل أنت متأكد من حذف تقييمك؟ لا يمكن التراجع عن هذا."
        confirmLabel="حذف"
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />

      {/* Report */}
      <ReportDialog
        open={reportOpen}
        reviewId={review.id}
        onClose={() => setReportOpen(false)}
      />

      {/* Photo lightbox */}
      <Dialog open={lightbox !== null} onClose={() => setLightbox(null)}>
        {lightbox && (
          <div className="relative aspect-square w-full overflow-hidden rounded-card bg-surface-muted">
            <Image
              src={lightbox}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 32rem"
              className="object-contain"
            />
          </div>
        )}
      </Dialog>
    </article>
  );
}

/** Loads the viewer's own review (with photo keys) and renders the edit form. */
function EditMyReview({
  restaurantId,
  onDone,
}: {
  restaurantId: Id<"restaurants">;
  onDone: () => void;
}) {
  const mine = useQuery(api.reviews.getMine, { restaurantId });

  if (mine === undefined) return <p className="text-ink-muted">جارٍ التحميل…</p>;
  if (mine === null) {
    return <p className="text-ink-muted">لم نعثر على تقييمك.</p>;
  }

  return (
    <ReviewForm
      restaurantId={restaurantId}
      existing={{
        id: mine.id,
        rating: mine.rating,
        body: mine.body,
        photoKeys: mine.photoKeys,
      }}
      onDone={onDone}
    />
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-muted">
        <Image src={url} alt={name} fill sizes="40px" className="object-cover" />
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
      {name.trim()[0] ?? "؟"}
    </span>
  );
}

function ReportDialog({
  open,
  reviewId,
  onClose,
}: {
  open: boolean;
  reviewId: Review["id"];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const createReport = useMutation(api.reports.create);
  const [reason, setReason] = useState<ReportReason>("spam");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const result = await createReport({
        targetType: "review",
        targetId: reviewId,
        reason,
        note: note.trim() || undefined,
      });
      if (result.duplicate) {
        toast({ title: "سبق أن أبلغت عن هذا", variant: "success" });
      } else {
        toast({ title: "شكراً، تم استلام بلاغك", variant: "success" });
      }
      onClose();
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="الإبلاغ عن تقييم">
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          السبب
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value as ReportReason)}
            className="rounded-card border border-ink/10 bg-surface px-3 py-2 text-ink"
          >
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {REASON_LABELS[r]}
              </option>
            ))}
          </select>
        </label>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="ملاحظة (اختياري)"
          rows={3}
          className="w-full rounded-card border border-ink/10 bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-pill border border-ink-muted/30 px-5 py-2 text-ink transition hover:bg-surface-muted disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-pill bg-brand-500 px-5 py-2 font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            {busy ? "جارٍ…" : "إرسال"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
