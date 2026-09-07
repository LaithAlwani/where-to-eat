"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import type { Id } from "@repo/backend/dataModel";
import { useToast } from "./ui/ToastProvider";
import { ClaimDialog } from "./ClaimDialog";

type ClaimSectionProps = {
  restaurantId: Id<"restaurants">;
  isClaimed: boolean;
};

/**
 * Ownership affordance on a restaurant profile: a verified badge when the place
 * is already claimed, otherwise a subtle "claim this page" prompt that opens the
 * ClaimDialog (auth-gated — unauthenticated viewers get a toast).
 */
export function ClaimSection({ restaurantId, isClaimed }: ClaimSectionProps) {
  const { isAuthenticated } = useConvexAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  if (isClaimed) {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-accent-50 px-3 py-1 text-sm font-medium text-accent-700">
        <span aria-hidden>✅</span>
        موثق من صاحب المكان
      </span>
    );
  }

  function openDialog() {
    if (!isAuthenticated) {
      toast({ title: "سجّل الدخول للمطالبة بالصفحة", variant: "error" });
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface-muted px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-ink">هل أنت مالك هذا المكان؟</span>
          <span className="text-sm text-ink-muted">
            طالِب بالصفحة مجاناً لإدارة معلوماتها.
          </span>
        </div>
        <button
          type="button"
          onClick={openDialog}
          className="rounded-pill bg-brand-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          طالِب بالصفحة
        </button>
      </div>

      {isAuthenticated && (
        <ClaimDialog
          open={open}
          onClose={() => setOpen(false)}
          restaurantId={restaurantId}
        />
      )}
    </>
  );
}
