type PriceTierProps = {
  tier: 1 | 2 | 3 | 4;
  size?: "sm" | "md";
};

const SIZE_CLASS = {
  sm: "text-sm",
  md: "text-base",
} as const;

/**
 * Price level shown as filled/empty currency glyphs out of four (e.g. "$$"
 * active of "$$$$"), with an accessible Arabic label.
 */
export function PriceTier({ tier, size = "sm" }: PriceTierProps) {
  const label = `مستوى السعر ${tier} من ٤`;
  return (
    <span
      className={`inline-flex font-medium tracking-wide ${SIZE_CLASS[size]}`}
      aria-label={label}
    >
      <span className="text-accent-600" aria-hidden>
        {"$".repeat(tier)}
      </span>
      <span className="text-ink-muted/40" aria-hidden>
        {"$".repeat(4 - tier)}
      </span>
    </span>
  );
}
