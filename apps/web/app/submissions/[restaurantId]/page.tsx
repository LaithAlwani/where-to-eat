import type { Id } from "@repo/backend/dataModel";
import { SubmissionEditForm } from "@/components/SubmissionEditForm";

export default async function SubmissionEditPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">تعديل الطلب</h1>
        <p className="text-ink-muted">
          عدّل بيانات المطعم وأعد إرساله للمراجعة.
        </p>
      </header>
      <SubmissionEditForm restaurantId={restaurantId as Id<"restaurants">} />
    </main>
  );
}
