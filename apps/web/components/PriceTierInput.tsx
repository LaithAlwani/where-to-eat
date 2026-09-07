"use client";

type PriceTier = 1 | 2 | 3 | 4;

type PriceTierInputProps = {
  value: PriceTier;
  onChange: (value: PriceTier) => void;
};

const TIERS: PriceTier[] = [1, 2, 3, 4];

/**
 * Interactive price-level picker mirroring the read-only <PriceTier> style:
 * four "$" buttons, the chosen tier and everything below it filled.
 */
export function PriceTierInput({ value, onChange }: PriceTierInputProps) {
  return (
    <div
      role="radiogroup"
      aria-label="مستوى السعر"
      className="inline-flex items-center gap-2"
    >
      {TIERS.map((tier) => {
        const active = tier <= value;
        return (
          <button
            key={tier}
            type="button"
            role="radio"
            aria-checked={value === tier}
            aria-label={`مستوى السعر ${tier} من ٤`}
            onClick={() => onChange(tier)}
            className={`flex h-10 w-10 items-center justify-center rounded-card text-lg font-bold transition ${
              active
                ? "bg-accent-500 text-white"
                : "bg-surface text-ink-muted/50 ring-1 ring-ink/10 hover:bg-surface-muted"
            }`}
          >
            $
          </button>
        );
      })}
    </div>
  );
}
