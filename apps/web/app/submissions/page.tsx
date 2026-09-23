import { SubmissionsPage } from "@/components/SubmissionsPage";
import { PageContainer } from "@/components/PageContainer";

export default function Submissions() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-ink">طلباتي</h1>
      <SubmissionsPage />
    </PageContainer>
  );
}
