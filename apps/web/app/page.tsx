import { SearchBar } from "@/components/SearchBar";
import { CategoryChips } from "@/components/CategoryChips";
import { CityChips } from "@/components/CityChips";
import { HomeDiscovery } from "@/components/HomeDiscovery";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="flex flex-col items-center gap-5 py-6 text-center">
        <h1 className="text-4xl font-extrabold text-brand-600 sm:text-5xl">
          وين ناكل
        </h1>
        <p className="text-lg text-ink-muted">اكتشف أحلى الأماكن حواليك</p>
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
