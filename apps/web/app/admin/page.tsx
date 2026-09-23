import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PageContainer } from "@/components/PageContainer";

export default function AdminPage() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <AdminDashboard />
    </PageContainer>
  );
}
