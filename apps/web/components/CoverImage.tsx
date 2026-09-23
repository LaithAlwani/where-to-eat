import Image from "next/image";

type CoverImageProps = {
  url: string | null;
  nameAr: string;
  className?: string;
  rounded?: string;
  /** Kept for call-site compatibility; unused (no glyph placeholder anymore). */
  glyphClassName?: string;
};

// Placeholder food photos (Unsplash) shown until a real cover is uploaded.
// ponytail: stock fallback for demo; real R2 cover (url) always wins.
const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80&auto=format&fit=crop",
];

/** Stable food photo per restaurant (hash of the name → fixed image). */
function foodFallback(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return FOOD_IMAGES[h % FOOD_IMAGES.length]!;
}

/**
 * Restaurant cover art. Renders the real R2 cover when present, otherwise a
 * deterministic stock food photo. object-cover is direction-neutral (RTL-safe).
 */
export function CoverImage({
  url,
  nameAr,
  className = "",
  rounded = "rounded-card",
}: CoverImageProps) {
  const src = url ?? foodFallback(nameAr);
  return (
    <div className={`relative overflow-hidden bg-surface-muted ${rounded} ${className}`}>
      <Image
        src={src}
        alt={nameAr}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        className="object-cover"
      />
    </div>
  );
}
