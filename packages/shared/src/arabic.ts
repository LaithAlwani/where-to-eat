/**
 * Arabic text utilities shared by write-time indexing and query-time search.
 *
 * `normalizeArabic` MUST be applied identically when building a restaurant's
 * `searchText` and when normalizing a user's query, so diacritics/spelling
 * variants collapse to the same form and the Convex search index matches.
 */

const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭ]/g;
const TATWEEL = /ـ/g;
const ALEF_VARIANTS = /[آأإٱ]/g; // آ أ إ ٱ -> ا
const WHITESPACE = /\s+/g;

/**
 * Fold an Arabic/Latin string to a normalized search form:
 * strip tashkeel + tatweel, unify alef/ya/ta-marbuta variants,
 * lowercase Latin, and collapse whitespace.
 */
export function normalizeArabic(input: string): string {
  return input
    .replace(TASHKEEL, "")
    .replace(TATWEEL, "")
    .replace(ALEF_VARIANTS, "ا") // ا
    .replace(/ى/g, "ي") // ى -> ي
    .replace(/ة/g, "ه") // ة -> ه
    .replace(/ؤ/g, "و") // ؤ -> و
    .replace(/ئ/g, "ي") // ئ -> ي
    .toLowerCase()
    .replace(WHITESPACE, " ")
    .trim();
}

/**
 * Build the denormalized `searchText` blob for a restaurant from its
 * bilingual name plus taxonomy labels. Pass any relevant Ar/En strings.
 */
export function buildSearchText(parts: ReadonlyArray<string | undefined>): string {
  return normalizeArabic(parts.filter(Boolean).join(" "));
}

const EASTERN_ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Render Western digits in a string as Eastern Arabic numerals (display only). */
export function toEasternArabicDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => EASTERN_ARABIC_DIGITS[Number(d)]!);
}
