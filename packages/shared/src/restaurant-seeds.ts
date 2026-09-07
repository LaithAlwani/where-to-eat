/**
 * Sample restaurant seed data for development. Ratings are fixed (no RNG — Convex
 * mutations are deterministic). Slugs reference the taxonomy in constants.ts.
 */
import type { PriceTier } from "./domain";

export interface MenuItemSeed {
  nameAr: string;
  nameEn?: string;
  price?: number;
  currency?: string;
}

export interface MenuSectionSeed {
  nameAr: string;
  nameEn?: string;
  items: MenuItemSeed[];
}

export interface RestaurantSeed {
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  citySlug: string;
  neighborhoodSlug?: string;
  categorySlugs: string[];
  cuisineSlugs: string[];
  priceTier: PriceTier;
  phone?: string;
  instagram?: string;
  ratingAvg: number;
  ratingCount: number;
  menu?: MenuSectionSeed[];
}

export const RESTAURANT_SEEDS: readonly RestaurantSeed[] = [
  {
    slug: "beit-jabri",
    nameAr: "بيت جبري",
    nameEn: "Beit Jabri",
    descriptionAr: "مطعم دمشقي عريق في قلب باب توما بأجواء تراثية.",
    citySlug: "damascus",
    neighborhoodSlug: "bab-touma",
    categorySlugs: ["restaurants"],
    cuisineSlugs: ["shami", "grill"],
    priceTier: 3,
    phone: "+963112220000",
    ratingAvg: 4.4,
    ratingCount: 182,
    menu: [
      {
        nameAr: "المقبلات",
        nameEn: "Appetizers",
        items: [
          { nameAr: "حمص", nameEn: "Hummus", price: 15000, currency: "SYP" },
          { nameAr: "فتوش", nameEn: "Fattoush", price: 18000, currency: "SYP" },
          { nameAr: "تبولة", nameEn: "Tabbouleh", price: 18000, currency: "SYP" },
        ],
      },
      {
        nameAr: "المشاوي",
        nameEn: "Grill",
        items: [
          { nameAr: "شيش طاووق", nameEn: "Shish Tawook", price: 45000, currency: "SYP" },
          { nameAr: "كباب", nameEn: "Kebab", price: 50000, currency: "SYP" },
        ],
      },
    ],
  },
  {
    slug: "al-nawfara-cafe",
    nameAr: "مقهى النوفرة",
    nameEn: "Al-Nawfara Café",
    descriptionAr: "أشهر مقهى شعبي في دمشق القديمة خلف الجامع الأموي.",
    citySlug: "damascus",
    neighborhoodSlug: "bab-touma",
    categorySlugs: ["cafes"],
    cuisineSlugs: ["shami"],
    priceTier: 1,
    ratingAvg: 4.6,
    ratingCount: 240,
  },
  {
    slug: "al-nabil",
    nameAr: "مطعم النبيل",
    nameEn: "Al-Nabil",
    descriptionAr: "مشاوي ومأكولات شامية في المزة بأجواء عائلية.",
    citySlug: "damascus",
    neighborhoodSlug: "mezzeh",
    categorySlugs: ["restaurants"],
    cuisineSlugs: ["grill", "shami"],
    priceTier: 3,
    phone: "+963116110000",
    ratingAvg: 4.5,
    ratingCount: 321,
  },
  {
    slug: "joud-shawarma",
    nameAr: "شاورما جود",
    nameEn: "Joud Shawarma",
    descriptionAr: "شاورما دجاج ولحم طازجة في الشعلان.",
    citySlug: "damascus",
    neighborhoodSlug: "shaalan",
    categorySlugs: ["fast-food"],
    cuisineSlugs: ["shawarma"],
    priceTier: 1,
    instagram: "joud.shawarma",
    ratingAvg: 4.7,
    ratingCount: 542,
    menu: [
      {
        nameAr: "الساندويشات",
        nameEn: "Sandwiches",
        items: [
          { nameAr: "شاورما دجاج", nameEn: "Chicken Shawarma", price: 20000, currency: "SYP" },
          { nameAr: "شاورما لحمة", nameEn: "Meat Shawarma", price: 25000, currency: "SYP" },
        ],
      },
    ],
  },
  {
    slug: "rozana-cafe",
    nameAr: "كافيه روزانا",
    nameEn: "Rozana Café",
    descriptionAr: "كافيه هادئ للفطور والقهوة في أبو رمانة.",
    citySlug: "damascus",
    neighborhoodSlug: "abu-rummaneh",
    categorySlugs: ["cafes"],
    cuisineSlugs: ["breakfast"],
    priceTier: 2,
    ratingAvg: 4.3,
    ratingCount: 151,
  },
  {
    slug: "farrouj-al-sham",
    nameAr: "فروج الشام",
    nameEn: "Farrouj Al-Sham",
    descriptionAr: "فروج مشوي على الفحم في الميدان.",
    citySlug: "damascus",
    neighborhoodSlug: "midan",
    categorySlugs: ["fast-food", "restaurants"],
    cuisineSlugs: ["grill"],
    priceTier: 1,
    ratingAvg: 4.2,
    ratingCount: 96,
  },
  {
    slug: "al-samadi-sweets",
    nameAr: "حلويات الصمدي",
    nameEn: "Al-Samadi Sweets",
    descriptionAr: "حلويات شرقية وبقلاوة حلبية شهيرة.",
    citySlug: "aleppo",
    neighborhoodSlug: "aziziyah",
    categorySlugs: ["sweets"],
    cuisineSlugs: ["shami"],
    priceTier: 2,
    ratingAvg: 4.8,
    ratingCount: 613,
  },
  {
    slug: "al-andalus-aleppo",
    nameAr: "مطعم الأندلس",
    nameEn: "Al-Andalus",
    descriptionAr: "مأكولات حلبية أصيلة في العزيزية.",
    citySlug: "aleppo",
    neighborhoodSlug: "aziziyah",
    categorySlugs: ["restaurants"],
    cuisineSlugs: ["shami", "grill"],
    priceTier: 3,
    ratingAvg: 4.4,
    ratingCount: 208,
  },
  {
    slug: "burger-house-aleppo",
    nameAr: "برغر هاوس",
    nameEn: "Burger House",
    descriptionAr: "برغر لحم أنغوس وبطاطا مقلية في الفرقان.",
    citySlug: "aleppo",
    neighborhoodSlug: "furqan",
    categorySlugs: ["fast-food"],
    cuisineSlugs: ["burger"],
    priceTier: 2,
    ratingAvg: 4.1,
    ratingCount: 133,
    menu: [
      {
        nameAr: "البرغر",
        nameEn: "Burgers",
        items: [
          { nameAr: "برغر كلاسيك", nameEn: "Classic Burger", price: 40000, currency: "SYP" },
          { nameAr: "برغر دبل", nameEn: "Double Burger", price: 55000, currency: "SYP" },
        ],
      },
    ],
  },
  {
    slug: "al-samaka-latakia",
    nameAr: "مطعم السمكة",
    nameEn: "Al-Samaka",
    descriptionAr: "مأكولات بحرية طازجة على كورنيش اللاذقية.",
    citySlug: "latakia",
    neighborhoodSlug: "corniche",
    categorySlugs: ["restaurants"],
    cuisineSlugs: ["seafood"],
    priceTier: 3,
    ratingAvg: 4.5,
    ratingCount: 176,
  },
  {
    slug: "abu-al-ezz-homs",
    nameAr: "مطعم أبو العز",
    nameEn: "Abu Al-Ezz",
    descriptionAr: "مشاوي ومأكولات حمصية في الحمراء.",
    citySlug: "homs",
    neighborhoodSlug: "hamra",
    categorySlugs: ["restaurants"],
    cuisineSlugs: ["grill"],
    priceTier: 2,
    ratingAvg: 4.3,
    ratingCount: 162,
  },
];
