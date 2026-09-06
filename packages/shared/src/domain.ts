/**
 * Domain enums and literal unions shared across backend and clients.
 * Kept free of any Convex import so both the schema and the UIs can use them.
 */

export const USER_ROLES = ["user", "owner", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const RESTAURANT_STATUSES = [
  "pending",
  "published",
  "rejected",
  "closed",
] as const;
export type RestaurantStatus = (typeof RESTAURANT_STATUSES)[number];

export const REVIEW_STATUSES = ["visible", "pending", "hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const CLAIM_STATUSES = ["pending", "approved", "rejected"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const REPORT_STATUSES = ["open", "actioned", "dismissed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_TARGET_TYPES = ["review", "restaurant"] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

/** Price tier 1..4 shown as ﷼ / $ glyphs in the UI. */
export const PRICE_TIERS = [1, 2, 3, 4] as const;
export type PriceTier = (typeof PRICE_TIERS)[number];

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** Standard page size for paginated lists — keeps document reads bounded. */
export const DEFAULT_PAGE_SIZE = 12;

export const REPORT_REASONS = [
  "spam",
  "offensive",
  "fake",
  "wrong_info",
  "not_relevant",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
