import { toEasternArabicDigits } from "@repo/shared/arabic";

export type PriceTier = 1 | 2 | 3 | 4;

/** Category slug → Material Symbol glyph (fallback `restaurant`). */
export const CATEGORY_ICON: Record<string, string> = {
  restaurants: "restaurant",
  cafes: "local_cafe",
  sweets: "cake",
  bakeries: "bakery_dining",
  "fast-food": "lunch_dining",
  grill: "outdoor_grill",
  shawarma: "lunch_dining",
  seafood: "set_meal",
  breakfast: "egg_alt",
  pizza: "local_pizza",
  burger: "lunch_dining",
};

export const PRICE_TIERS: { tier: PriceTier; label: string }[] = [
  { tier: 1, label: "رخيص" },
  { tier: 2, label: "وسط" },
  { tier: 3, label: "غالي" },
  { tier: 4, label: "فاخر" },
];

/** Amber required-field marker. */
export function Required() {
  return (
    <span aria-hidden className="text-accent-ink">
      {" *"}
    </span>
  );
}

/** Section card with an Arabic-Indic numbered marker + heading. */
export function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-7 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-on-accent"
        >
          {toEasternArabicDigits(step)}
        </span>
        <h2 className="font-heading text-lg font-black text-ink">{title}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/** Checklist row: filled teal check when satisfied, muted outline otherwise. */
export function ChecklistRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        aria-hidden
        className={`ms ${ok ? "text-accent-600" : "text-ink-muted"}`}
      >
        {ok ? "check_circle" : "radio_button_unchecked"}
      </span>
      <span className={ok ? "text-ink" : "text-ink-muted"}>{label}</span>
    </li>
  );
}

/** Icon grid for picking category slugs (multi-select). */
export function CategoryGrid({
  categories,
  selected,
  onToggle,
}: {
  categories:
    | { slug: string; nameAr: string; nameEn: string }[]
    | undefined;
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  if (categories === undefined) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="min-h-24 animate-pulse rounded-card bg-surface-muted"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {categories.map((category) => {
        const active = selected.includes(category.slug);
        return (
          <button
            key={category.slug}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(category.slug)}
            className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-card border p-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              active
                ? "border-brand-500 bg-brand-500 text-on-accent"
                : "border-line bg-bg text-ink hover:border-brand-500"
            }`}
          >
            <span
              aria-hidden
              className={`ms text-3xl ${active ? "text-on-accent" : "text-accent-ink"}`}
            >
              {CATEGORY_ICON[category.slug] ?? "restaurant"}
            </span>
            <span className="font-heading text-sm font-black leading-tight text-balance">
              {category.nameAr}
            </span>
            <span
              dir="ltr"
              className={`text-xs ${active ? "text-on-accent/80" : "text-ink-muted"}`}
            >
              {category.nameEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** 4-button price-tier selector matching the submit form. */
export function PriceTierGrid({
  value,
  onChange,
}: {
  value: PriceTier;
  onChange: (tier: PriceTier) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="مستوى السعر"
      className="grid grid-cols-4 gap-2"
    >
      {PRICE_TIERS.map(({ tier, label }) => {
        const active = value === tier;
        return (
          <button
            key={tier}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(tier)}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-card border py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              active
                ? "border-accent-600 bg-accent-600 text-white"
                : "border-line bg-surface text-ink-muted hover:border-accent-600"
            }`}
          >
            <span className="font-bold">{"$".repeat(tier)}</span>
            <span className="text-xs">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Icon-prefixed contact input (phone/whatsapp/instagram/website). */
export function ContactInput({
  label,
  icon,
  value,
  onChange,
  ...inputProps
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
      {label}
      <div className="flex items-center gap-2 rounded-card border border-ink/10 bg-surface px-3 focus-within:border-brand-400">
        <span aria-hidden className="ms text-ink-muted">
          {icon}
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2 text-ink placeholder:text-ink-muted focus:outline-none"
          {...inputProps}
        />
      </div>
    </label>
  );
}
