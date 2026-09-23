import { FavoritesGrid } from "@/components/FavoritesGrid";
import { PageContainer } from "@/components/PageContainer";

export default function FavoritesPage() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-ink">المفضلة</h1>
      <FavoritesGrid />
    </PageContainer>
  );
}
