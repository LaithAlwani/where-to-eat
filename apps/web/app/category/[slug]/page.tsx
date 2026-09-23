import { CategoryGrid } from "@/components/CategoryGrid";
import { PageContainer } from "@/components/PageContainer";

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;

  return (
    <PageContainer className="flex flex-col gap-6">
      <CategoryGrid slug={slug} />
    </PageContainer>
  );
}
