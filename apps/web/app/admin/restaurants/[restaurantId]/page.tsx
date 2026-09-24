import Link from "next/link";
import type { Id } from "@repo/backend/dataModel";
import { AdminRestaurantEdit } from "@/components/admin/AdminRestaurantEdit";
import { PageContainer } from "@/components/PageContainer";

export default async function AdminRestaurantEditPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link
          href="/admin"
          className="w-fit text-sm font-medium text-brand-600 hover:underline"
        >
          ← لوحة الإدارة
        </Link>
        <h1 className="font-heading text-2xl font-bold text-ink">
          تعديل المطعم (إدارة)
        </h1>
        <p className="text-ink-muted">عدّل بيانات المطعم واحفظ التغييرات.</p>
      </header>
      <AdminRestaurantEdit
        restaurantId={restaurantId as Id<"restaurants">}
      />
    </PageContainer>
  );
}
