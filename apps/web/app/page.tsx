import { FeaturedPick } from "@/components/home/FeaturedPick";
import { CategoryGridHome } from "@/components/home/CategoryGridHome";
import { OpenNowSection } from "@/components/home/OpenNowSection";
import { TopRatedList } from "@/components/home/TopRatedList";
import { CitiesSection } from "@/components/home/CitiesSection";
import { SearchPill } from "@/components/home/SearchPill";

/**
 * Home. Mobile is the "one answer" flow: title → featured pick → search →
 * categories → open now → top rated → cities. From md up the hero becomes a
 * 2-col split (intro + categories on the start side, featured pick on the end)
 * while the lower sections stay full-width.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-6 md:gap-20 md:px-10 md:py-10">
      {/* Hero */}
      <section className="flex flex-col gap-8 md:grid md:grid-cols-2 md:items-center md:gap-12">
        {/* Intro column (start side on desktop) */}
        <div className="flex flex-col gap-5 md:gap-7">
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-5xl font-black leading-[1.05] tracking-tight text-ink md:text-6xl lg:text-7xl">
              وين ناكل؟
            </h1>
            <p className="max-w-prose text-lg text-ink-muted md:text-xl">
              أحلى المطاعم والكافيهات بكل سوريا، مع تقييمات حقيقية من ناس بتعرف شو
              عم تاكل.
            </p>
          </div>
          {/* Desktop only: search + categories live in the intro column */}
          <div className="hidden md:block">
            <SearchPill />
          </div>
          <div className="hidden md:block">
            <CategoryGridHome />
          </div>
        </div>

        {/* Featured pick (end side on desktop, 2nd on mobile) */}
        <FeaturedPick />

        {/* Mobile only: search + categories flow after the featured pick */}
        <div className="md:hidden">
          <SearchPill />
        </div>
        <div className="md:hidden">
          <CategoryGridHome />
        </div>
      </section>

      <OpenNowSection />
      <TopRatedList />
      <CitiesSection />
    </main>
  );
}
