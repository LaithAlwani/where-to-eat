import { RestaurantSubmitForm } from "@/components/RestaurantSubmitForm";

export default function SubmitPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">أضف مطعماً</h1>
        <p className="text-ink-muted">
          شاركنا مكاناً تحبه — سيظهر للجميع بعد مراجعته.
        </p>
      </header>
      <RestaurantSubmitForm />
    </main>
  );
}
