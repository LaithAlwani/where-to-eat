import { SearchResults } from "@/components/SearchResults";
import { PageContainer } from "@/components/PageContainer";

type PriceTierValue = 1 | 2 | 3 | 4;

function parsePriceTier(raw: string | string[] | undefined): PriceTierValue | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  return n === 1 || n === 2 || n === 3 || n === 4 ? n : undefined;
}

function firstParam(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function SearchPage(props: PageProps<"/search">) {
  const sp = await props.searchParams;

  return (
    <PageContainer className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-ink">البحث</h1>
      <SearchResults
        q={firstParam(sp.q) ?? ""}
        cityId={firstParam(sp.cityId)}
        priceTier={parsePriceTier(sp.priceTier)}
      />
    </PageContainer>
  );
}
