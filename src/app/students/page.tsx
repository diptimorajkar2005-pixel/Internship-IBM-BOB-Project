import { AppShell, PageHero } from "@/components/AppShell";
import { DownloadBar } from "@/components/DownloadBar";
import { Filters } from "@/components/Filters";
import { StudentDetail } from "@/components/StudentDetail";
import { StudentTable } from "@/components/StudentTable";
import { IMAGES } from "@/lib/constants";
import { filterQueryString, getFilteredStudents, parseFilters } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const records = await getFilteredStudents(filters);
  const selected = records.find((row) => row.studentId === filters.selectedStudent);
  const query = filterQueryString(filters);

  return (
    <AppShell filters={filters}>
      <PageHero
        kicker="Roster"
        title="Student Performance"
        subtitle="Search, inspect, and compare individual academic profiles from the filtered dataset."
        image={IMAGES.library}
      />
      <Filters showSearch />
      <section className="split-grid">
        <StudentTable records={records} query={query} selectedId={filters.selectedStudent} />
        <StudentDetail student={selected} />
      </section>
      <DownloadBar query={query} />
    </AppShell>
  );
}
