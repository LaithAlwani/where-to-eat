import { CityList } from "@/components/CityList";
import { AuthPanel } from "@/components/AuthPanel";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-brand-600">وين ناكل</h1>
        <p className="text-lg text-ink-muted">اكتشف أحلى الأماكن حواليك</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">المدن</h2>
        <CityList />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">الحساب</h2>
        <AuthPanel />
      </section>
    </main>
  );
}
