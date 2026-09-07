import type { Id } from "@repo/backend/dataModel";
import { OwnerEditor } from "@/components/OwnerEditor";

export default async function OwnerEditorPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <OwnerEditor restaurantId={restaurantId as Id<"restaurants">} />
    </main>
  );
}
