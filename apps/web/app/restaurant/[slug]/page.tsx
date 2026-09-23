import { RestaurantProfile } from "@/components/RestaurantProfile";
import { PageContainer } from "@/components/PageContainer";

export default async function RestaurantPage(
  props: PageProps<"/restaurant/[slug]">,
) {
  const { slug } = await props.params;

  return (
    <PageContainer>
      <RestaurantProfile slug={slug} />
    </PageContainer>
  );
}
