"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/**
 * Accessible modal built on the native <dialog> element. Uses showModal() for
 * the browser's built-in focus trap + top-layer rendering, closes on Escape
 * (the `cancel` event) and on backdrop click, and stays RTL-correct via logical
 * utilities. No native popups (alert/confirm) anywhere in the app rely on this.
 */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Keep the DOM dialog state in sync with the `open` prop.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  // Escape fires a `cancel` event; intercept it so React owns the close.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? "dialog-title" : undefined}
      onClick={(event) => {
        // A click that lands on the <dialog> itself (not its content) is a
        // backdrop click.
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50 open:animate-none"
    >
      <div className="themed-scroll flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-6">
        {title && (
          <div className="flex items-center justify-between gap-4">
            <h2 id="dialog-title" className="text-lg font-bold text-ink">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="rounded-pill px-2 py-1 text-xl leading-none text-ink-muted transition hover:bg-surface-muted"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </dialog>
  );
}
