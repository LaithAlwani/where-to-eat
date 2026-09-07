"use client";

import { useEffect } from "react";
import { useToastStore, type Toast } from "./ToastProvider";

const AUTO_DISMISS_MS = 4000;

/**
 * Renders the stacked, auto-dismissing toasts from ToastProvider. Fixed to the
 * bottom of the viewport, centered, non-blocking (pointer-events managed per
 * toast). RTL-aware: text is start-aligned and the stack is horizontally
 * centered so it reads correctly in both directions.
 */
export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isError = toast.variant === "error";

  return (
    <div
      role="status"
      className={[
        "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card px-4 py-3 text-start shadow-lg",
        isError
          ? "bg-brand-600 text-white"
          : "bg-accent-600 text-white",
      ].join(" ")}
    >
      <span aria-hidden className="text-lg leading-none">
        {isError ? "⚠️" : "✅"}
      </span>
      <span className="flex-1 text-sm font-medium">{toast.title}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="إغلاق"
        className="rounded-pill px-1 text-white/80 transition hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
