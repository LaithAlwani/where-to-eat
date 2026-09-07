"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Horizontal scroller with a hidden native scrollbar and desktop arrow buttons.
 * On touch/mobile the arrows are hidden and native swipe scrolling is used.
 * RTL-aware: "start" is the inline-start (right) edge.
 */
export function ScrollRail({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // scrollLeft is negative in RTL
    setOverflowing(maxScroll > 4);
    setAtStart(pos <= 1);
    setAtEnd(pos >= maxScroll - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const scrollBy = (dir: "start" | "end") => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const amount = el.clientWidth * 0.8;
    const sign = dir === "end" ? 1 : -1;
    el.scrollBy({ left: (rtl ? -sign : sign) * amount, behavior: "smooth" });
  };

  return (
    <div className="group relative">
      <div
        ref={ref}
        className={`no-scrollbar flex snap-x scroll-px-4 gap-4 overflow-x-auto ${className}`}
      >
        {children}
      </div>

      {overflowing && !atStart && (
        <RailArrow side="start" onClick={() => scrollBy("start")} />
      )}
      {overflowing && !atEnd && (
        <RailArrow side="end" onClick={() => scrollBy("end")} />
      )}
    </div>
  );
}

function RailArrow({
  side,
  onClick,
}: {
  side: "start" | "end";
  onClick: () => void;
}) {
  const pos = side === "start" ? "start-1" : "end-1";
  // App is RTL: start edge is on the right → chevron points right, end → left.
  const rotate = side === "start" ? "rotate-180" : "";
  return (
    <button
      type="button"
      aria-label={side === "start" ? "السابق" : "التالي"}
      onClick={onClick}
      className={`absolute top-1/2 ${pos} z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink/10 bg-surface/90 text-ink shadow-md backdrop-blur transition hover:bg-surface sm:flex`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`size-5 ${rotate}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m15 6-6 6 6 6" />
      </svg>
    </button>
  );
}
