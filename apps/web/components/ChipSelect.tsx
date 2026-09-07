"use client";

type Option = { slug: string; nameAr: string; icon?: string };

type ChipSelectProps = {
  options: Option[] | undefined;
  selected: string[];
  onToggle: (slug: string) => void;
  emptyMessage?: string;
};

/**
 * Multi-select rendered as toggleable pills. Click a chip to add/remove its
 * slug from `selected`. Presentational: the parent owns the selection array.
 */
export function ChipSelect({
  options,
  selected,
  onToggle,
  emptyMessage = "لا توجد خيارات",
}: ChipSelectProps) {
  if (options === undefined) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="h-8 w-20 animate-pulse rounded-pill bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.slug);
        return (
          <button
            key={option.slug}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option.slug)}
            className={`inline-flex items-center gap-1.5 rounded-pill px-4 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-brand-500 text-white"
                : "bg-surface text-ink ring-1 ring-ink/10 hover:bg-surface-muted"
            }`}
          >
            {option.icon && <span aria-hidden>{option.icon}</span>}
            {option.nameAr}
          </button>
        );
      })}
    </div>
  );
}
