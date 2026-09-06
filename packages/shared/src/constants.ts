/**
 * Seed taxonomy for وين ناكل. Consumed by the Convex seed mutation and by
 * client filters. Slugs are stable ASCII identifiers; display is bilingual.
 */

export interface CitySeed {
  slug: string;
  nameAr: string;
  nameEn: string;
  neighborhoods: NeighborhoodSeed[];
}

export interface NeighborhoodSeed {
  slug: string;
  nameAr: string;
  nameEn: string;
}

export interface CategorySeed {
  slug: string;
  nameAr: string;
  nameEn: string;
  icon: string;
}

export interface CuisineSeed {
  slug: string;
  nameAr: string;
  nameEn: string;
}

export const CITY_SEEDS: readonly CitySeed[] = [
  {
    slug: "damascus",
    nameAr: "دمشق",
    nameEn: "Damascus",
    neighborhoods: [
      { slug: "mezzeh", nameAr: "المزة", nameEn: "Mezzeh" },
      { slug: "abu-rummaneh", nameAr: "أبو رمانة", nameEn: "Abu Rummaneh" },
      { slug: "shaalan", nameAr: "الشعلان", nameEn: "Al-Shaalan" },
      { slug: "malki", nameAr: "المالكي", nameEn: "Al-Maliki" },
      { slug: "bab-touma", nameAr: "باب توما", nameEn: "Bab Touma" },
      { slug: "midan", nameAr: "الميدان", nameEn: "Al-Midan" },
    ],
  },
  {
    slug: "aleppo",
    nameAr: "حلب",
    nameEn: "Aleppo",
    neighborhoods: [
      { slug: "aziziyah", nameAr: "العزيزية", nameEn: "Al-Aziziyah" },
      { slug: "furqan", nameAr: "الفرقان", nameEn: "Al-Furqan" },
      { slug: "sulaymaniyah", nameAr: "السليمانية", nameEn: "Al-Sulaymaniyah" },
    ],
  },
  {
    slug: "homs",
    nameAr: "حمص",
    nameEn: "Homs",
    neighborhoods: [
      { slug: "inshaat", nameAr: "الإنشاءات", nameEn: "Al-Inshaat" },
      { slug: "hamra", nameAr: "الحمراء", nameEn: "Al-Hamra" },
    ],
  },
  {
    slug: "latakia",
    nameAr: "اللاذقية",
    nameEn: "Latakia",
    neighborhoods: [
      { slug: "corniche", nameAr: "الكورنيش", nameEn: "Corniche" },
      { slug: "ziraa", nameAr: "الزراعة", nameEn: "Al-Ziraa" },
    ],
  },
  {
    slug: "hama",
    nameAr: "حماة",
    nameEn: "Hama",
    neighborhoods: [{ slug: "hadher", nameAr: "الحاضر", nameEn: "Al-Hadher" }],
  },
  {
    slug: "tartus",
    nameAr: "طرطوس",
    nameEn: "Tartus",
    neighborhoods: [{ slug: "corniche", nameAr: "الكورنيش", nameEn: "Corniche" }],
  },
];

export const CATEGORY_SEEDS: readonly CategorySeed[] = [
  { slug: "restaurants", nameAr: "مطاعم", nameEn: "Restaurants", icon: "🍽️" },
  { slug: "cafes", nameAr: "كافيهات", nameEn: "Cafés", icon: "☕" },
  { slug: "sweets", nameAr: "حلويات", nameEn: "Sweets", icon: "🍰" },
  { slug: "bakeries", nameAr: "مخابز", nameEn: "Bakeries", icon: "🥖" },
  { slug: "fast-food", nameAr: "وجبات سريعة", nameEn: "Fast Food", icon: "🍔" },
];

export const CUISINE_SEEDS: readonly CuisineSeed[] = [
  { slug: "shami", nameAr: "شامي", nameEn: "Shami" },
  { slug: "grill", nameAr: "مشاوي", nameEn: "Grill" },
  { slug: "shawarma", nameAr: "شاورما", nameEn: "Shawarma" },
  { slug: "burger", nameAr: "برغر", nameEn: "Burger" },
  { slug: "pizza", nameAr: "بيتزا", nameEn: "Pizza" },
  { slug: "seafood", nameAr: "بحري", nameEn: "Seafood" },
  { slug: "italian", nameAr: "إيطالي", nameEn: "Italian" },
  { slug: "breakfast", nameAr: "فطور", nameEn: "Breakfast" },
];
