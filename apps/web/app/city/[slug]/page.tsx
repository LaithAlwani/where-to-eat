import { CityGrid } from "@/components/CityGrid";
import { PageContainer } from "@/components/PageContainer";

export default async function CityPage(props: PageProps<"/city/[slug]">) {
  const { slug } = await props.params;

  return (
    <PageContainer className="flex flex-col gap-6">
      <CityGrid slug={slug} />
    </PageContainer>
  );
}
