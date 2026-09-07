import { toEasternArabicDigits } from "@repo/shared/arabic";

/** Map ISO-ish currency codes to their short Arabic symbol. */
const CURRENCY_LABELS: Record<string, string> = {
  SYP: "ل.س",
  USD: "$",
  TRY: "₺",
  EUR: "€",
};

/**
 * Format a price with grouped thousands and its Arabic currency label, using
 * Eastern Arabic digits. e.g. formatPrice(20000, "SYP") → "٢٠٬٠٠٠ ل.س".
 */
export function formatPrice(price: number, currency?: string): string {
  const grouped = new Intl.NumberFormat("ar", {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(price);
  // Intl already yields Arabic digits under the "ar" locale, but normalize any
  // stray Latin digits for consistency.
  const digits = toEasternArabicDigits(grouped);
  const label = currency ? (CURRENCY_LABELS[currency] ?? currency) : "";
  return label ? `${digits} ${label}` : digits;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("ar", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** Format a millisecond timestamp as an Arabic long date (e.g. ٦ سبتمبر ٢٠٢٦). */
export function formatDate(ms: number): string {
  return DATE_FORMATTER.format(new Date(ms));
}
