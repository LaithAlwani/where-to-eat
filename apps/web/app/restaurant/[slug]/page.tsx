import { RestaurantProfile } from "@/components/RestaurantProfile";

export default async function RestaurantPage(
  props: PageProps<"/restaurant/[slug]">,
) {
  const { slug } = await props.params;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <RestaurantProfile slug={slug} />
    </main>
  );
}
