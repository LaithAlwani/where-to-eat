import { t, type MessageKey } from "@repo/shared/i18n";

/** Error codes the backend throws and that we map to localized messages. */
const KNOWN_CODES = [
  "unauthenticated",
  "forbidden",
  "not_found",
  "duplicate_review",
  "invalid_input",
  "rate_limited",
  "unknown",
] as const;

type KnownCode = (typeof KNOWN_CODES)[number];

function isKnownCode(code: string): code is KnownCode {
  return (KNOWN_CODES as readonly string[]).includes(code);
}

/**
 * Read `err.data.code` from a thrown ConvexError (shape `{ data: { code,
 * message } }`), defaulting to "unknown" when absent or unrecognized.
 */
export function getErrorCode(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object" && "code" in data) {
      const code = (data as { code?: unknown }).code;
      if (typeof code === "string") return code;
    }
  }
  return "unknown";
}

/** Map any error to its Arabic message via the shared i18n catalog. */
export function getErrorMessage(err: unknown): string {
  const code = getErrorCode(err);
  const key: MessageKey = isKnownCode(code)
    ? (`error.${code}` as MessageKey)
    : "error.unknown";
  return t(key);
}
