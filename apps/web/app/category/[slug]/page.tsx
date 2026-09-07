import { CategoryGrid } from "@/components/CategoryGrid";

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <CategoryGrid slug={slug} />
    </main>
  );
}
