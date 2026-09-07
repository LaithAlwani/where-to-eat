"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

/**
 * Confirmation modal built on <Dialog>. Replaces window.confirm(). Handles an
 * async `onConfirm` with a busy state and only closes on success.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={busy ? () => {} : onClose} title={title}>
      {description && <p className="text-ink-muted">{description}</p>}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-pill border border-ink-muted/30 px-5 py-2 text-ink transition hover:bg-surface-muted disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          className="rounded-pill bg-brand-500 px-5 py-2 font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {busy ? "جارٍ…" : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
