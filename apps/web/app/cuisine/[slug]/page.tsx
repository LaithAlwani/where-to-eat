import { CuisineGrid } from "@/components/CuisineGrid";
import { PageContainer } from "@/components/PageContainer";

export default async function CuisinePage(props: PageProps<"/cuisine/[slug]">) {
  const { slug } = await props.params;

  return (
    <PageContainer className="flex flex-col gap-6">
      <CuisineGrid slug={slug} />
    </PageContainer>
  );
}
