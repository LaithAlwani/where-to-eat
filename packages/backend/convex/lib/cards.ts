import type { Doc } from "../_generated/dataModel";
import { resolveImageUrl } from "../r2";

/** Card view-model: only the fields a list card renders (with resolved cover URL). */
export async function toCard(r: Doc<"restaurants">) {
  return {
    id: r._id,
    slug: r.slug,
    nameAr: r.nameAr,
    nameEn: r.nameEn ?? null,
    cityNameAr: r.cityNameAr,
    neighborhoodNameAr: r.neighborhoodNameAr ?? null,
    priceTier: r.priceTier,
    ratingAvg: r.ratingAvg,
    ratingCount: r.ratingCount,
    coverUrl: await resolveImageUrl(r.coverKey),
  };
}

/** Project a bounded list of restaurant docs to cards (resolves cover URLs). */
export function toCards(rows: Doc<"restaurants">[]) {
  return Promise.all(rows.map(toCard));
}
