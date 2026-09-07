"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@repo/backend";
import type { Id } from "@repo/backend/dataModel";
import { getErrorMessage } from "@/lib/errors";
import { inputClass, labelClass, hintClass } from "@/lib/ui";
import { Dialog } from "./ui/Dialog";
import { useToast } from "./ui/ToastProvider";

type ClaimDialogProps = {
  open: boolean;
  onClose: () => void;
  restaurantId: Id<"restaurants">;
};

/**
 * Ownership-claim request. Optional contact phone + note, submitted via
 * claims.claim. Assumes the caller only opens it for signed-in viewers.
 */
export function ClaimDialog({ open, onClose, restaurantId }: ClaimDialogProps) {
  const { toast } = useToast();
  const claim = useMutation(api.claims.claim);
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const result = await claim({
        restaurantId,
        contactPhone: contactPhone.trim() || undefined,
        note: note.trim() || undefined,
      });
      if (result.duplicate) {
        toast({ title: "لديك طلب قيد المراجعة", variant: "success" });
      } else {
        toast({ title: "تم إرسال طلب المطالبة", variant: "success" });
      }
      onClose();
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="المطالبة بالصفحة">
      <div className="flex flex-col gap-4">
        <p className="text-ink-muted">
          أثبت أنك صاحب المكان لتتمكن من تعديل معلوماته والرد على التقييمات.
        </p>

        <label className={labelClass}>
          رقم للتواصل <span className={hintClass}>(اختياري)</span>
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className={inputClass}
            dir="ltr"
            inputMode="tel"
            placeholder="+963…"
          />
        </label>

        <label className={labelClass}>
          ملاحظة <span className={hintClass}>(اختياري)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="عرّف بنفسك وصلتك بالمكان…"
          />
        </label>

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
            {busy ? "جارٍ…" : "إرسال الطلب"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
