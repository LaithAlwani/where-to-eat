import { ConvexError } from "convex/values";

/**
 * Stable error codes thrown by backend functions. Clients map these to a
 * localized message (see @repo/shared i18n) and never surface raw stack traces.
 */
export type AppErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "duplicate_review"
  | "rate_limited"
  | "invalid_input";

export function appError(code: AppErrorCode, message?: string): never {
  throw new ConvexError({ code, message: message ?? code });
}
