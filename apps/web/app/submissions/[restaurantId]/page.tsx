import type { Id } from "@repo/backend/dataModel";
import { SubmissionEditForm } from "@/components/SubmissionEditForm";
import { PageContainer } from "@/components/PageContainer";

export default async function SubmissionEditPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold text-ink">تعديل الطلب</h1>
        <p className="text-ink-muted">
          عدّل بيانات المطعم وأعد إرساله للمراجعة.
        </p>
      </header>
      <SubmissionEditForm restaurantId={restaurantId as Id<"restaurants">} />
    </PageContainer>
  );
}
