import { SearchBar } from "@/components/SearchBar";
import { CategoryChips } from "@/components/CategoryChips";
import { CityChips } from "@/components/CityChips";
import { HomeDiscovery } from "@/components/HomeDiscovery";
import { PageContainer } from "@/components/PageContainer";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Full-bleed hero gradient fading into the page (no card). */}
      <section className="bg-linear-to-b from-brand-50 via-surface-muted to-surface">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-14 text-center sm:py-20">
          <h1 className="font-heading text-5xl font-extrabold text-brand-700 sm:text-6xl">
            وين ناكل
          </h1>
          <p className="text-lg text-ink-muted sm:text-xl">
            اكتشف أحلى الأماكن حواليك في سوريا
          </p>
          <span aria-hidden className="h-1 w-20 rounded-pill bg-accent-500" />
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>
      </section>

      <PageContainer className="flex flex-col gap-12">
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-bold text-ink">التصنيفات</h2>
          <CategoryChips />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-bold text-ink">المدن</h2>
          <CityChips />
        </section>

        <HomeDiscovery />
      </PageContainer>
    </div>
  );
}
