import {
  AssessmentComparisonChart,
  CorrelationHeatmap,
} from "@/components/Charts";
import { AppShell, PageHero } from "@/components/AppShell";
import { DownloadBar } from "@/components/DownloadBar";
import { Filters } from "@/components/Filters";
import { getAssessmentAverages, getCorrelationMatrix } from "@/lib/analytics";
import { IMAGES } from "@/lib/constants";
import { generateInsights } from "@/lib/insights";
import { filterQueryString, getFilteredStudents, parseFilters } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const records = await getFilteredStudents(filters);
  const insights = generateInsights(records);
  const query = filterQueryString(filters);

  return (
    <AppShell filters={filters}>
      <PageHero
        kicker="Insights"
        title="Data Insights"
        subtitle="Descriptive findings calculated from the currently filtered dataset. Correlation is not causation."
        image={IMAGES.campus}
      />
      <Filters />
      <section className="insight-grid">
        <article className="insight-card">
          <h3>Overall Insights</h3>
          <ul>{insights.overall.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="insight-card">
          <h3>Attendance Insights</h3>
          <ul>{insights.attendance.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="insight-card">
          <h3>Study Insights</h3>
          <ul>{insights.study.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="insight-card">
          <h3>Department Insights</h3>
          <ul>{insights.department.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="insight-card">
          <h3>Academic Attention Insights</h3>
          <ul>{insights.academicAttention.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </section>
      <section className="chart-grid">
        <AssessmentComparisonChart data={getAssessmentAverages(records)} />
        <CorrelationHeatmap matrix={getCorrelationMatrix(records)} />
      </section>
      <DownloadBar query={query} />
    </AppShell>
  );
}
