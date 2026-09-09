/**
 * Minimal bilingual message catalog. Arabic is the default; English is
 * secondary. Errors thrown by the backend carry a stable code that clients
 * map to one of these localized strings (never a raw exception).
 */
import type { Locale } from "./domain";

export type MessageKey =
  | "app.name"
  | "app.tagline"
  | "error.unauthenticated"
  | "error.forbidden"
  | "error.not_found"
  | "error.duplicate_review"
  | "error.invalid_input"
  | "error.rate_limited"
  | "error.unknown";

type Catalog = Record<MessageKey, string>;

const AR: Catalog = {
  "app.name": "وين ناكل",
  "app.tagline": "اكتشف أحلى الأماكن حواليك",
  "error.unauthenticated": "الرجاء تسجيل الدخول للمتابعة",
  "error.forbidden": "لا تملك صلاحية لهذا الإجراء",
  "error.not_found": "العنصر غير موجود",
  "error.duplicate_review": "لقد قمت بتقييم هذا المكان من قبل",
  "error.invalid_input": "المدخلات غير صحيحة",
  "error.rate_limited": "حاول مرة أخرى بعد قليل",
  "error.unknown": "حدث خطأ ما، حاول مرة أخرى",
};

const EN: Catalog = {
  "app.name": "Ween Nakol",
  "app.tagline": "Discover the best places around you",
  "error.unauthenticated": "Please sign in to continue",
  "error.forbidden": "You don't have permission for this action",
  "error.not_found": "Item not found",
  "error.duplicate_review": "You've already reviewed this place",
  "error.invalid_input": "Invalid input",
  "error.rate_limited": "Please try again in a moment",
  "error.unknown": "Something went wrong, please try again",
};

const CATALOGS: Record<Locale, Catalog> = { ar: AR, en: EN };

export function t(key: MessageKey, locale: Locale = "ar"): string {
  return CATALOGS[locale][key];
}
