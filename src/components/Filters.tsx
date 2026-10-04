import { Suspense } from "react";
import { FilterBar } from "@/components/FilterBar";
import { getFilterOptions } from "@/lib/repository";

export async function Filters({ showSearch = false }: { showSearch?: boolean }) {
  const options = await getFilterOptions();
  return (
    <Suspense fallback={<section className="filter-bar">Loading filters…</section>}>
      <FilterBar showSearch={showSearch} options={options} />
    </Suspense>
  );
}
