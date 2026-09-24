import { RestaurantSubmitForm } from "@/components/RestaurantSubmitForm";
import { PageContainer } from "@/components/PageContainer";

export default function SubmitPage() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-heading text-3xl font-black text-ink sm:text-4xl">
          أضف مطعماً
        </h1>
        <p className="text-ink-muted">
          شاركنا مكاناً تحبه — سيظهر للجميع بعد مراجعته.
        </p>
      </header>
      <RestaurantSubmitForm />
    </PageContainer>
  );
}
