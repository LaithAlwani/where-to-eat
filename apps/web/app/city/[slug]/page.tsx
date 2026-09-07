import { CityGrid } from "@/components/CityGrid";

export default async function CityPage(props: PageProps<"/city/[slug]">) {
  const { slug } = await props.params;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <CityGrid slug={slug} />
    </main>
  );
}
