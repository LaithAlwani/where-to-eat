"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type PopoverProps = {
  /** Accessible label for the trigger button. */
  label: string;
  /** Trigger button contents (icon + text/badge). */
  trigger: ReactNode;
  /** Extra classes for the trigger button. */
  triggerClassName?: string;
  /** Extra classes for the panel (e.g. width, max-height). */
  panelClassName?: string;
  /** Panel content; receives a `close` fn so items can dismiss the popover. */
  children: (close: () => void) => ReactNode;
};

/**
 * Animated, anchored dropdown for the desktop account menu + notifications.
 *
 * Renders a trigger button and an absolutely-positioned panel inside a
 * `relative` wrapper. The panel aligns to the inline-end edge, sits below the
 * trigger, and is capped so it never overflows the viewport horizontally on
 * small screens. Open/close uses a mounted+visible pattern so the exit
 * animation plays before unmount; everything collapses to an instant
 * appear/disappear under `motion-reduce`.
 */
export function Popover({
  label,
  trigger,
  triggerClassName,
  panelClassName,
  children,
}: PopoverProps) {
  const [mounted, setMounted] = useState(false); // in the DOM
  const [visible, setVisible] = useState(false); // animation target state
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const open = useCallback(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  // Once mounted, flip to visible on the next frame so the transition runs.
  useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  // Close on outside pointerdown + Escape while mounted.
  useEffect(() => {
    if (!mounted) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mounted, close]);

  // When the exit finishes, unmount and return focus to the trigger.
  const handleTransitionEnd = () => {
    if (!visible) {
      setMounted(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={mounted}
        aria-controls={mounted ? panelId : undefined}
        onClick={() => (mounted ? close() : open())}
        className={triggerClassName}
      >
        {trigger}
      </button>

      {mounted && (
        <div
          id={panelId}
          aria-label={label}
          onTransitionEnd={handleTransitionEnd}
          className={`absolute inset-e-0 top-full z-40 mt-2 max-w-[calc(100vw-2rem)] origin-top rounded-card border border-line bg-surface shadow-2xl transition duration-150 ease-out motion-reduce:transition-none ${
            visible
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-1 scale-95 opacity-0"
          } ${panelClassName ?? ""}`}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}
