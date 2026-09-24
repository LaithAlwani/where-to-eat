"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/**
 * Slide-in sheet for the mobile menu. A full-height panel pinned to the
 * inline-end edge with a dimmed backdrop. The panel slides in from the edge it
 * is pinned to (direction-aware via `rtl:`/`ltr:` variants) while the backdrop
 * fades. Uses a mounted+visible pattern so the exit animation plays before
 * unmount; `motion-reduce` collapses to an instant show/hide. Closes on
 * backdrop click + Escape, locks body scroll while open, and moves focus into
 * the panel.
 */
export function Drawer({ open, onClose, title, children }: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);

  // Derive mount/exit from the `open` prop during render (avoids cascading
  // effects): opening mounts immediately, closing kicks off the exit.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMounted(true);
    else setVisible(false);
  }

  // Flip to visible on the next frame once mounted so the transition runs.
  useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  // Escape closes; lock body scroll; move focus into the panel while open.
  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted, onClose]);

  const handleTransitionEnd = () => {
    if (!visible) setMounted(false);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onTransitionEnd={handleTransitionEnd}
        className={`absolute inset-e-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col bg-surface shadow-2xl outline-none transition-transform duration-200 ease-out motion-reduce:transition-none ${
          visible
            ? "translate-x-0"
            : "ltr:translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
          <h2 className="font-heading text-lg font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex size-9 cursor-pointer items-center justify-center rounded-pill text-xl leading-none text-ink-muted transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            ✕
          </button>
        </div>
        <div className="themed-scroll flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
