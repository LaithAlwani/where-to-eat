import { SearchBar } from "@/components/SearchBar";
import { CategoryChips } from "@/components/CategoryChips";
import { CityChips } from "@/components/CityChips";
import { HomeDiscovery } from "@/components/HomeDiscovery";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="flex flex-col items-center gap-5 rounded-card bg-linear-to-b from-brand-50 to-surface px-4 py-14 text-center">
        <h1 className="font-heading text-5xl font-bold text-brand-700 sm:text-6xl">
          وين ناكل
        </h1>
        <p className="text-lg text-ink-muted">
          اكتشف أحلى الأماكن حواليك في سوريا
        </p>
        <span aria-hidden className="h-1 w-16 rounded-pill bg-accent-500" />
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-ink">التصنيفات</h2>
        <CategoryChips />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-ink">المدن</h2>
        <CityChips />
      </section>

      <HomeDiscovery />
    </main>
  );
}
