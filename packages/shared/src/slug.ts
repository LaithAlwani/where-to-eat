/**
 * ASCII slug from arbitrary text. Arabic-only input yields an empty string,
 * so callers should fall back to a base + unique suffix.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
