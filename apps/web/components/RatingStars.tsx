import { toEasternArabicDigits } from "@repo/shared/arabic";

type RatingStarsProps = {
  value: number;
  count?: number;
  size?: "sm" | "md";
};

const SIZE_CLASS = {
  sm: "text-sm",
  md: "text-lg",
} as const;

/**
 * Five-star rating with fractional fill (e.g. 4.6 fills 4.6 stars) rendered by
 * clipping a colored star layer over a muted one. Optional review count is
 * shown in Arabic digits.
 */
export function RatingStars({ value, count, size = "sm" }: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const fillPct = (clamped / 5) * 100;
  const label = `${clamped.toFixed(1)} من ٥`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${SIZE_CLASS[size]}`}
      aria-label={label}
    >
      <span className="relative inline-block leading-none" aria-hidden>
        <span className="text-ink-muted/30">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden whitespace-nowrap text-brand-500"
          style={{ width: `${fillPct}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="font-medium text-ink">
        {toEasternArabicDigits(clamped.toFixed(1))}
      </span>
      {count !== undefined && (
        <span className="text-ink-muted" aria-hidden>
          ({toEasternArabicDigits(count)})
        </span>
      )}
    </span>
  );
}
