"use client";

import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { useToast } from "./ui/ToastProvider";
import { getErrorMessage } from "@/lib/errors";

/**
 * Save/unsave a restaurant. Heart fills when favorited. Unauthenticated clicks
 * prompt a sign-in toast; mutation errors surface via toast.
 */
export function FavoriteButton({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const { isAuthenticated } = useConvexAuth();
  const { toast } = useToast();
  const isFavorite = useQuery(
    api.favorites.isFavorite,
    isAuthenticated ? { restaurantId } : "skip",
  );
  const toggle = useMutation(api.favorites.toggle);
  const [busy, setBusy] = useState(false);

  const favorited = isFavorite === true;

  async function onClick() {
    if (!isAuthenticated) {
      toast({ title: "سجّل الدخول لحفظ المكان", variant: "error" });
      return;
    }
    setBusy(true);
    try {
      const result = await toggle({ restaurantId });
      toast({
        title: result.favorited ? "أُضيف إلى المفضلة" : "أُزيل من المفضلة",
        variant: "success",
      });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={favorited}
      className={`inline-flex items-center gap-1.5 rounded-pill px-5 py-2 font-medium ring-1 transition disabled:opacity-50 ${
        favorited
          ? "bg-brand-50 text-brand-600 ring-brand-200"
          : "bg-surface text-ink ring-ink/10 hover:bg-surface-muted"
      }`}
    >
      <span aria-hidden className={favorited ? "text-brand-500" : ""}>
        {favorited ? "❤️" : "🤍"}
      </span>
      حفظ
    </button>
  );
}
