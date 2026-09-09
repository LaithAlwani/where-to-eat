"use client";

import { useState } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { useToast } from "../ui/ToastProvider";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { EmptyState, LoadMoreButton, QueueSkeleton } from "./shared";

type Role = "user" | "owner" | "admin";

type AdminUser = {
  id: Id<"users">;
  name: string;
  email: string;
  role: Role;
  isBanned: boolean;
  createdAt: number;
};

const ROLE_LABELS: Record<Role, string> = {
  user: "مستخدم",
  owner: "صاحب عمل",
  admin: "مشرف",
};

/** Users tab: paginated list with role select + ban toggle per row. */
export function UsersTab() {
  const { toast } = useToast();
  const setRole = useMutation(api.admin.setUserRole);
  const setBanned = useMutation(api.admin.setUserBanned);
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.listUsers,
    {},
    { initialNumItems: 20 },
  );

  // Which user is pending a ban confirmation (banning is destructive).
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);

  async function changeRole(user: AdminUser, role: Role) {
    if (role === user.role) return;
    try {
      await setRole({ userId: user.id, role });
      toast({ title: "تم تحديث الدور", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    }
  }

  async function unban(user: AdminUser) {
    try {
      await setBanned({ userId: user.id, banned: false });
      toast({ title: "تم إلغاء الحظر", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    }
  }

  async function confirmBan() {
    if (!banTarget) return;
    try {
      await setBanned({ userId: banTarget.id, banned: true });
      toast({ title: "تم الحظر", variant: "success" });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
      throw err; // keep the confirm dialog open on failure
    }
  }

  if (status === "LoadingFirstPage") return <QueueSkeleton rows={5} />;
  if (results.length === 0)
    return <EmptyState icon="👤" message="لا يوجد مستخدمون" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="themed-scroll overflow-x-auto rounded-card ring-1 ring-ink/5">
        <table className="w-full min-w-160 border-collapse text-start text-sm">
          <thead>
            <tr className="bg-surface-muted text-ink-muted">
              <th className="px-4 py-3 text-start font-medium">الاسم</th>
              <th className="px-4 py-3 text-start font-medium">البريد</th>
              <th className="px-4 py-3 text-start font-medium">الدور</th>
              <th className="px-4 py-3 text-start font-medium">تاريخ الانضمام</th>
              <th className="px-4 py-3 text-start font-medium">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {results.map((user) => (
              <tr
                key={user.id}
                className={`border-t border-ink/5 ${
                  user.isBanned ? "bg-red-50/60" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                <td className="px-4 py-3 text-ink-muted">
                  <span dir="ltr">{user.email}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user, e.target.value as Role)}
                    className="rounded-pill border border-ink/10 bg-surface px-3 py-1.5 text-ink"
                  >
                    {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {user.isBanned ? (
                    <button
                      type="button"
                      onClick={() => unban(user)}
                      className="rounded-pill border border-ink-muted/30 px-4 py-1.5 font-medium text-ink transition hover:bg-surface-muted"
                    >
                      إلغاء الحظر
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBanTarget(user)}
                      className="rounded-pill border border-red-300 px-4 py-1.5 font-medium text-red-700 transition hover:bg-red-50"
                    >
                      حظر
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LoadMoreButton status={status} loadMore={loadMore} />

      <ConfirmDialog
        open={banTarget !== null}
        title="حظر المستخدم"
        description={
          banTarget ? `سيتم حظر "${banTarget.name}". هل أنت متأكد؟` : undefined
        }
        confirmLabel="حظر"
        onConfirm={confirmBan}
        onClose={() => setBanTarget(null)}
      />
    </div>
  );
}
