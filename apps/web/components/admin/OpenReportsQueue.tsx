"use client";

import { useState } from "react";
import Link from "next/link";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "../ui/ToastProvider";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import {
  AdminCard,
  EmptyState,
  LoadMoreButton,
  QueueSkeleton,
  dangerBtnClass,
  neutralBtnClass,
} from "./shared";

type ReportTarget =
  | {
      kind: "review";
      id: string;
      body: string | null;
      authorName: string;
      restaurantSlug: string | null;
    }
  | { kind: "restaurant"; id: string; nameAr: string; slug: string }
  | null;

type OpenReport = {
  id: Id<"reports">;
  targetType: "review" | "restaurant";
  reason: string;
  note: string | null;
  createdAt: number;
  reporterName: string | null;
  target: ReportTarget;
};

/** Queue of open reports with target-aware moderation actions. */
export function OpenReportsQueue() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.openReports,
    {},
    { initialNumItems: 20 },
  );

  if (status === "LoadingFirstPage") return <QueueSkeleton />;
  if (results.length === 0) return <EmptyState message="لا توجد بلاغات" />;

  return (
    <div className="flex flex-col gap-3">
      {results.map((report) => (
        <ReportRow key={report.id} report={report} />
      ))}
      <LoadMoreButton status={status} loadMore={loadMore} />
    </div>
  );
}

type PendingConfirm = "hideReview" | "closeRestaurant" | null;

function ReportRow({ report }: { report: OpenReport }) {
  const { toast } = useToast();
  const resolveReport = useMutation(api.admin.resolveReport);
  const setReviewStatus = useMutation(api.admin.setReviewStatus);
  const setRestaurantStatus = useMutation(api.admin.setRestaurantStatus);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<PendingConfirm>(null);

  const target = report.target;

  async function dismiss() {
    setBusy(true);
    try {
      await resolveReport({ reportId: report.id, status: "dismissed" });
      toast({ title: "تم تجاهل البلاغ", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function hideReview() {
    if (target?.kind !== "review") return;
    try {
      await setReviewStatus({
        reviewId: target.id as Id<"reviews">,
        status: "hidden",
      });
      await resolveReport({ reportId: report.id, status: "actioned" });
      toast({ title: "تم إخفاء التقييم", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
      throw err;
    }
  }

  async function closeRestaurant() {
    if (target?.kind !== "restaurant") return;
    try {
      await setRestaurantStatus({
        restaurantId: target.id as Id<"restaurants">,
        status: "closed",
      });
      await resolveReport({ reportId: report.id, status: "actioned" });
      toast({ title: "تم إغلاق المطعم", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
      throw err;
    }
  }

  return (
    <AdminCard>
      <div className="flex flex-col gap-1">
        <p className="font-bold text-ink">سبب البلاغ: {report.reason}</p>
        <p className="text-xs text-ink-muted">
          {report.reporterName
            ? `المُبلِّغ: ${report.reporterName}`
            : "مُبلِّغ غير معروف"}{" "}
          · {formatDate(report.createdAt)}
        </p>
        {report.note && (
          <p className="rounded-card bg-surface-muted p-2 text-sm leading-relaxed text-ink">
            {report.note}
          </p>
        )}
      </div>

      <div className="rounded-card border-s-2 border-ink/10 bg-surface-muted/60 p-3">
        {target === null ? (
          <p className="text-sm text-ink-muted">العنصر محذوف</p>
        ) : target.kind === "review" ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-ink">
              تقييم بواسطة {target.authorName}
            </p>
            {target.body && (
              <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">
                {target.body}
              </p>
            )}
            {target.restaurantSlug && (
              <Link
                href={`/restaurant/${target.restaurantSlug}#reviews`}
                className="w-fit text-sm font-medium text-brand-600 transition hover:text-brand-700"
              >
                عرض التقييم
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-ink">مطعم: {target.nameAr}</p>
            <Link
              href={`/restaurant/${target.slug}`}
              className="w-fit text-sm font-medium text-brand-600 transition hover:text-brand-700"
            >
              عرض المطعم
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {target?.kind === "review" && (
          <button
            type="button"
            onClick={() => setConfirm("hideReview")}
            disabled={busy}
            className={dangerBtnClass}
          >
            إخفاء التقييم
          </button>
        )}
        {target?.kind === "restaurant" && (
          <button
            type="button"
            onClick={() => setConfirm("closeRestaurant")}
            disabled={busy}
            className={dangerBtnClass}
          >
            إغلاق المطعم
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          disabled={busy}
          className={neutralBtnClass}
        >
          تجاهل
        </button>
      </div>

      <ConfirmDialog
        open={confirm === "hideReview"}
        title="إخفاء التقييم"
        description="سيُخفى هذا التقييم ويُحل البلاغ. هل أنت متأكد؟"
        confirmLabel="إخفاء"
        onConfirm={hideReview}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "closeRestaurant"}
        title="إغلاق المطعم"
        description="سيُغلق هذا المطعم ويُحل البلاغ. هل أنت متأكد؟"
        confirmLabel="إغلاق"
        onConfirm={closeRestaurant}
        onClose={() => setConfirm(null)}
      />
    </AdminCard>
  );
}
