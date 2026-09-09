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

type PendingRestaurant = {
  id: Id<"restaurants">;
  slug: string;
  nameAr: string;
  cityNameAr: string;
  createdAt: number;
  submittedByName: string | null;
};

/** Queue of restaurants awaiting review, with publish / reject actions. */
export function PendingRestaurantsQueue() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.pendingRestaurants,
    {},
    { initialNumItems: 20 },
  );

  if (status === "LoadingFirstPage") return <QueueSkeleton />;
  if (results.length === 0)
    return <EmptyState message="لا توجد مطاعم بانتظار المراجعة" />;

  return (
    <div className="flex flex-col gap-3">
      {results.map((restaurant) => (
        <RestaurantRow key={restaurant.id} restaurant={restaurant} />
      ))}
      <LoadMoreButton status={status} loadMore={loadMore} />
    </div>
  );
}

function RestaurantRow({ restaurant }: { restaurant: PendingRestaurant }) {
  const { toast } = useToast();
  const setStatus = useMutation(api.admin.setRestaurantStatus);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function publish() {
    setBusy(true);
    try {
      await setStatus({ restaurantId: restaurant.id, status: "published" });
      toast({ title: "تم النشر", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function reject(note: string | undefined) {
    try {
      await setStatus({
        restaurantId: restaurant.id,
        status: "rejected",
        note,
      });
      toast({ title: "تم رفض المطعم", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
      throw err; // keep the reject dialog open on failure
    }
  }

  return (
    <AdminCard>
      <div className="flex flex-col gap-1">
        <Link
          href={`/restaurant/${restaurant.slug}`}
          className="w-fit text-lg font-bold text-ink transition hover:text-brand-600"
        >
          {restaurant.nameAr}
        </Link>
        <p className="text-sm text-ink-muted">{restaurant.cityNameAr}</p>
        <p className="text-xs text-ink-muted">
          {restaurant.submittedByName
            ? `أرسله: ${restaurant.submittedByName}`
            : "مُرسِل غير معروف"}{" "}
          · {formatDate(restaurant.createdAt)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={publish}
          disabled={busy}
          className={approveBtnClass}
        >
          نشر
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
        title="رفض المطعم"
        description={`سيتم رفض "${restaurant.nameAr}".`}
        onConfirm={reject}
        onClose={() => setConfirmOpen(false)}
      />
    </AdminCard>
  );
}
