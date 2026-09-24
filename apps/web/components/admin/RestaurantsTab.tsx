"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "../ui/ToastProvider";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { CoverImage } from "../CoverImage";
import { StatusBadge } from "../StatusBadge";
import { EmptyState, LoadMoreButton, QueueSkeleton } from "./shared";

type AdminRestaurant = {
  id: Id<"restaurants">;
  slug: string;
  nameAr: string;
  nameEn: string | null;
  cityNameAr: string;
  status: "pending" | "published" | "rejected" | "closed";
  ratingAvg: number;
  ratingCount: number;
  hasOwner: boolean;
  createdAt: number;
  coverUrl: string | null;
};

/**
 * Restaurants tab: name search + paginated table over every status, with an
 * edit link and a (cascading) delete per row. All backing functions are
 * requireAdmin-gated server-side.
 */
export function RestaurantsTab() {
  const { toast } = useToast();
  const deleteRestaurant = useMutation(api.admin.deleteRestaurant);

  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.listRestaurants,
    { q: q || undefined },
    { initialNumItems: 20 },
  );

  const [deleteTarget, setDeleteTarget] = useState<AdminRestaurant | null>(null);

  function onSearchChange(value: string) {
    setInput(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setQ(value.trim()), 300);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRestaurant({ restaurantId: deleteTarget.id });
      toast({ title: "تم حذف المطعم", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
      throw err; // keep the dialog open on failure
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="relative block">
        <span
          aria-hidden
          className="ms pointer-events-none absolute inset-y-0 inset-s-3 flex items-center text-[1.25rem] text-ink-muted"
        >
          search
        </span>
        <input
          value={input}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث عن مطعم بالاسم…"
          className="w-full rounded-pill border border-ink/10 bg-surface py-2.5 ps-11 pe-4 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none"
        />
      </label>

      {status === "LoadingFirstPage" ? (
        <QueueSkeleton rows={6} />
      ) : results.length === 0 ? (
        <EmptyState
          icon="🍽️"
          message={q ? "لا مطاعم مطابقة للبحث" : "لا مطاعم بعد"}
        />
      ) : (
        <>
          <div className="themed-scroll overflow-x-auto rounded-card ring-1 ring-ink/5">
            <table className="w-full min-w-200 border-collapse text-start text-sm">
              <thead>
                <tr className="bg-surface-muted text-ink-muted">
                  <th className="px-4 py-3 text-start font-medium">المطعم</th>
                  <th className="px-4 py-3 text-start font-medium">المدينة</th>
                  <th className="px-4 py-3 text-start font-medium">الحالة</th>
                  <th className="px-4 py-3 text-start font-medium">التقييم</th>
                  <th className="px-4 py-3 text-start font-medium">أُضيف</th>
                  <th className="px-4 py-3 text-start font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-t border-ink/5">
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <CoverImage
                          url={r.coverUrl}
                          nameAr={r.nameAr}
                          className="size-11 shrink-0"
                          rounded="rounded-lg"
                        />
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-medium text-ink">
                            {r.nameAr}
                          </span>
                          {r.nameEn && (
                            <span
                              dir="ltr"
                              className="truncate text-xs text-ink-muted"
                            >
                              {r.nameEn}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{r.cityNameAr}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {r.ratingCount > 0 ? (
                        <span dir="ltr">
                          ★ {r.ratingAvg.toFixed(1)} ({r.ratingCount})
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/restaurants/${r.id}`}
                          className="rounded-pill bg-brand-500 px-4 py-1.5 font-medium text-on-accent transition hover:bg-brand-600"
                        >
                          تعديل
                        </Link>
                        {r.status === "published" && (
                          <Link
                            href={`/restaurant/${r.slug}`}
                            className="rounded-pill border border-ink/10 px-4 py-1.5 font-medium text-ink transition hover:bg-surface-muted"
                          >
                            عرض
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(r)}
                          className="rounded-pill border border-red-300 px-4 py-1.5 font-medium text-red-700 transition hover:bg-red-50"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <LoadMoreButton status={status} loadMore={loadMore} />
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="حذف المطعم نهائياً"
        description={
          deleteTarget
            ? `سيتم حذف «${deleteTarget.nameAr}» مع كل تقييماته وصوره وقائمته وطلبات ملكيته نهائياً. لا يمكن التراجع.`
            : undefined
        }
        confirmLabel="حذف نهائي"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
