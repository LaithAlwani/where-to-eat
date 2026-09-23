import type { Id } from "@repo/backend/dataModel";
import { OwnerEditor } from "@/components/OwnerEditor";
import { PageContainer } from "@/components/PageContainer";

export default async function OwnerEditorPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  return (
    <PageContainer>
      <OwnerEditor restaurantId={restaurantId as Id<"restaurants">} />
    </PageContainer>
  );
}
