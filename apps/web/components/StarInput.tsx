"use client";

import { useState } from "react";

type StarInputProps = {
  value: number;
  onChange: (value: number) => void;
  size?: "md" | "lg";
};

const SIZE_CLASS = {
  md: "text-2xl",
  lg: "text-4xl",
} as const;

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * Interactive 1-5 star picker. RTL-correct: star 1 sits on the start side (we
 * lay the buttons out normally inside an RTL container so start = visual right).
 * Hover previews the fill; arrow keys adjust the value when focused.
 */
export function StarInput({ value, onChange, size = "md" }: StarInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  function step(delta: number) {
    const next = Math.max(1, Math.min(5, (value || 0) + delta));
    onChange(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="التقييم بالنجوم"
      className={`inline-flex items-center gap-1 ${SIZE_CLASS[size]}`}
      onMouseLeave={() => setHover(null)}
      onKeyDown={(event) => {
        // In RTL, "increase" toward higher stars is the start (right) arrow.
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          step(1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          step(-1);
        }
      }}
    >
      {STARS.map((star) => {
        const active = star <= shown;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} من ٥`}
            tabIndex={value === star || (value === 0 && star === 1) ? 0 : -1}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onFocus={() => setHover(star)}
            onBlur={() => setHover(null)}
            className={`leading-none transition ${
              active ? "text-amber-400" : "text-ink/20"
            } hover:scale-110`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
