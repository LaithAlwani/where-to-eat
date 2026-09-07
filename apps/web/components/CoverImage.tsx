type CoverImageProps = {
  coverKey: string | null;
  nameAr: string;
  className?: string;
  rounded?: string;
  /** Tailwind size class for the placeholder initial (defaults to card-sized). */
  glyphClassName?: string;
};

/**
 * Restaurant cover art. No images are uploaded yet, so `coverKey` is always
 * null and we render a branded gradient placeholder showing the first Arabic
 * letter (or a 🍽️ glyph). Structured so a real R2 URL can slot in later: when
 * `coverKey` becomes non-null, swap in an <img>/next-image here.
 */
export function CoverImage({
  coverKey,
  nameAr,
  className = "",
  rounded = "rounded-card",
  glyphClassName = "text-4xl",
}: CoverImageProps) {
  const initial = firstArabicLetter(nameAr);

  // Placeholder branch (currently always taken).
  if (!coverKey) {
    return (
      <div
        aria-hidden
        className={`flex items-center justify-center overflow-hidden bg-linear-to-br from-brand-400 to-accent-500 ${rounded} ${className}`}
      >
        <span
          className={`select-none font-bold leading-none text-white/90 ${glyphClassName}`}
        >
          {initial ?? "🍽️"}
        </span>
      </div>
    );
  }

  // Future: render the real R2-hosted cover for `coverKey` here.
  return (
    <div
      aria-hidden
      className={`bg-surface-muted ${rounded} ${className}`}
    />
  );
}

function firstArabicLetter(name: string): string | null {
  const match = name.match(/[؀-ۿ]/);
  return match ? match[0] : (name.trim()[0] ?? null);
}
