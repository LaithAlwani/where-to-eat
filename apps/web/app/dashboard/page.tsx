import { DashboardHome } from "@/components/DashboardHome";
import { PageContainer } from "@/components/PageContainer";

export default function DashboardPage() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-ink">لوحة التحكم</h1>
      <DashboardHome />
    </PageContainer>
  );
}
