import {
  AttendanceScatterChart,
  CategoryPieChart,
  DepartmentPerformanceChart,
  PerformanceDistributionChart,
  StudyScatterChart,
} from "@/components/Charts";
import { AppShell, PageHero } from "@/components/AppShell";
import { DownloadBar } from "@/components/DownloadBar";
import { Filters } from "@/components/Filters";
import { FormulaPanel } from "@/components/FormulaPanel";
import { KpiCards } from "@/components/KpiCards";
import { UploadPanel } from "@/components/UploadPanel";
import {
  getDepartmentAnalysis,
  getOverallStatistics,
  getPerformanceCategoryDistribution,
  getScoreDistribution,
} from "@/lib/analytics";
import { IMAGES } from "@/lib/constants";
import { filterQueryString, getFilteredStudents, parseFilters } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const records = await getFilteredStudents(filters);
  const stats = getOverallStatistics(records);
  const query = filterQueryString(filters);

  return (
    <AppShell filters={filters}>
      <PageHero
        kicker="Overview"
        title="Student Performance Analytics Dashboard"
        subtitle="Turn academic CSV data into KPIs, relationships, and teacher-ready insights."
        image={IMAGES.campus}
      />
      <UploadPanel />
      <Filters />
      <KpiCards stats={stats} />
      <FormulaPanel />
      {records.length === 0 ? (
        <section className="empty-card">
          <h3>No students match the current filters</h3>
          <p>Reset filters to return to the full dataset.</p>
        </section>
      ) : (
        <section className="chart-grid">
          <PerformanceDistributionChart data={getScoreDistribution(records)} />
          <DepartmentPerformanceChart data={getDepartmentAnalysis(records)} />
          <AttendanceScatterChart records={records} />
          <StudyScatterChart records={records} />
          <CategoryPieChart data={getPerformanceCategoryDistribution(records)} />
        </section>
      )}
      <DownloadBar query={query} />
    </AppShell>
  );
}
