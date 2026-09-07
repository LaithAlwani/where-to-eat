import Image from "next/image";

type CoverImageProps = {
  url: string | null;
  nameAr: string;
  className?: string;
  rounded?: string;
  /** Tailwind size class for the placeholder initial (defaults to card-sized). */
  glyphClassName?: string;
};

/**
 * Restaurant cover art. When `url` is a real R2-hosted image we render it
 * filling/covering the box (RTL-safe, since object-cover is direction-neutral);
 * otherwise we fall back to a branded gradient placeholder showing the first
 * Arabic letter (or a 🍽️ glyph).
 */
export function CoverImage({
  url,
  nameAr,
  className = "",
  rounded = "rounded-card",
  glyphClassName = "text-4xl",
}: CoverImageProps) {
  if (url) {
    return (
      <div className={`relative overflow-hidden bg-surface-muted ${rounded} ${className}`}>
        <Image
          src={url}
          alt={nameAr}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="object-cover"
        />
      </div>
    );
  }

  const initial = firstArabicLetter(nameAr);
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

function firstArabicLetter(name: string): string | null {
  const match = name.match(/[؀-ۿ]/);
  return match ? match[0] : (name.trim()[0] ?? null);
}
