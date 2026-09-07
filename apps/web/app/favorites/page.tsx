import { FavoritesGrid } from "@/components/FavoritesGrid";

export default function FavoritesPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-ink">المفضلة</h1>
      <FavoritesGrid />
    </main>
  );
}
