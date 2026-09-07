/**
 * Shared Tailwind class strings for form controls and buttons. Centralized so
 * every form stays visually consistent and RTL-correct (only logical utilities).
 */

export const inputClass =
  "w-full rounded-card border border-ink/10 bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none";

export const labelClass = "flex flex-col gap-1 text-sm font-medium text-ink";

export const hintClass = "text-xs font-normal text-ink-muted";

export const primaryBtnClass =
  "rounded-pill bg-brand-500 px-6 py-2 font-medium text-white transition hover:bg-brand-600 disabled:opacity-50";

export const secondaryBtnClass =
  "rounded-pill border border-ink-muted/30 px-5 py-2 font-medium text-ink transition hover:bg-surface-muted disabled:opacity-50";

export const ghostBtnClass =
  "rounded-pill px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink";
