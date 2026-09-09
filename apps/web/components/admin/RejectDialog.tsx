"use client";

import { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { inputClass, labelClass, hintClass } from "@/lib/ui";

type RejectDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  /** Receives the trimmed reason, or undefined when left empty. */
  onConfirm: (note: string | undefined) => void | Promise<void>;
  onClose: () => void;
};

/**
 * Reject-with-reason modal built on <Dialog>. The reason is optional; an empty
 * textarea yields `undefined`. Handles an async onConfirm with a busy state and
 * only closes on success. Resets its textarea whenever it opens.
 */
export function RejectDialog({
  open,
  title,
  description,
  confirmLabel = "رفض",
  onConfirm,
  onClose,
}: RejectDialogProps) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // Discard the draft reason on any close so the next open starts empty.
  function handleClose() {
    setNote("");
    onClose();
  }

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm(note.trim() || undefined);
      handleClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={busy ? () => {} : handleClose} title={title}>
      {description && <p className="text-ink-muted">{description}</p>}
      <label className={labelClass}>
        سبب الرفض <span className={hintClass}>(اختياري)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="يظهر هذا السبب لصاحب الطلب…"
        />
      </label>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleClose}
          disabled={busy}
          className="rounded-pill border border-ink-muted/30 px-5 py-2 text-ink transition hover:bg-surface-muted disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          className="rounded-pill bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {busy ? "جارٍ…" : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
