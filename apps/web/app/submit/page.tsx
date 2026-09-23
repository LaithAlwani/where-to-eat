import { RestaurantSubmitForm } from "@/components/RestaurantSubmitForm";
import { PageContainer } from "@/components/PageContainer";

export default function SubmitPage() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold text-ink">أضف مطعماً</h1>
        <p className="text-ink-muted">
          شاركنا مكاناً تحبه — سيظهر للجميع بعد مراجعته.
        </p>
      </header>
      <RestaurantSubmitForm />
    </PageContainer>
  );
}
