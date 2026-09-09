"use client";

import { useState } from "react";
import Link from "next/link";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "../ui/ToastProvider";
import { RejectDialog } from "./RejectDialog";
import {
  AdminCard,
  EmptyState,
  LoadMoreButton,
  QueueSkeleton,
  approveBtnClass,
  dangerBtnClass,
} from "./shared";

type PendingClaim = {
  id: Id<"businessClaims">;
  createdAt: number;
  note: string | null;
  contactPhone: string | null;
  restaurant: { id: Id<"restaurants">; slug: string; nameAr: string } | null;
  user: { id: Id<"users">; name: string; email: string } | null;
};

/** Queue of ownership claims awaiting review, with approve / reject actions. */
export function PendingClaimsQueue() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.pendingClaims,
    {},
    { initialNumItems: 20 },
  );

  if (status === "LoadingFirstPage") return <QueueSkeleton />;
  if (results.length === 0)
    return <EmptyState message="لا توجد طلبات ملكية بانتظار المراجعة" />;

  return (
    <div className="flex flex-col gap-3">
      {results.map((claim) => (
        <ClaimRow key={claim.id} claim={claim} />
      ))}
      <LoadMoreButton status={status} loadMore={loadMore} />
    </div>
  );
}

function ClaimRow({ claim }: { claim: PendingClaim }) {
  const { toast } = useToast();
  const decide = useMutation(api.admin.decideClaim);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function approve() {
    setBusy(true);
    try {
      await decide({ claimId: claim.id, approve: true });
      toast({ title: "تمت الموافقة", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function reject(note: string | undefined) {
    try {
      await decide({ claimId: claim.id, approve: false, note });
      toast({ title: "تم رفض الطلب", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
      throw err;
    }
  }

  return (
    <AdminCard>
      <div className="flex flex-col gap-1">
        {claim.restaurant ? (
          <Link
            href={`/restaurant/${claim.restaurant.slug}`}
            className="w-fit text-lg font-bold text-ink transition hover:text-brand-600"
          >
            {claim.restaurant.nameAr}
          </Link>
        ) : (
          <span className="text-lg font-bold text-ink-muted">مطعم محذوف</span>
        )}
        <p className="text-sm text-ink">
          {claim.user
            ? `${claim.user.name} · ${claim.user.email}`
            : "مستخدم غير معروف"}
        </p>
        {claim.contactPhone && (
          <p className="text-sm text-ink-muted">
            هاتف التواصل: <span dir="ltr">{claim.contactPhone}</span>
          </p>
        )}
        {claim.note && (
          <p className="rounded-card bg-surface-muted p-2 text-sm leading-relaxed text-ink">
            {claim.note}
          </p>
        )}
        <p className="text-xs text-ink-muted">{formatDate(claim.createdAt)}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={approve}
          disabled={busy}
          className={approveBtnClass}
        >
          موافقة
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={busy}
          className={dangerBtnClass}
        >
          رفض
        </button>
      </div>

      <RejectDialog
        open={confirmOpen}
        title="رفض طلب الملكية"
        description="سيتم رفض هذا الطلب."
        onConfirm={reject}
        onClose={() => setConfirmOpen(false)}
      />
    </AdminCard>
  );
}
