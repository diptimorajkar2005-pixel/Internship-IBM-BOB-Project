import {
  StudyGroupPerformanceChart,
  StudyHoursDistributionChart,
  StudyScatterChart,
} from "@/components/Charts";
import { AppShell, PageHero } from "@/components/AppShell";
import { DownloadBar } from "@/components/DownloadBar";
import { Filters } from "@/components/Filters";
import { getOverallStatistics, getStudyHourAnalysis } from "@/lib/analytics";
import { IMAGES } from "@/lib/constants";
import { filterQueryString, getFilteredStudents, parseFilters } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const records = await getFilteredStudents(filters);
  const groups = getStudyHourAnalysis(records);
  const stats = getOverallStatistics(records);
  const query = filterQueryString(filters);

  return (
    <AppShell filters={filters}>
      <PageHero
        kicker="Study hours"
        title="Study analysis"
        subtitle="Explore weekly study-hour groups and their association with performance and attendance."
        image={IMAGES.studyGroup}
      />
      <Filters />
      <section className="banner info">Average study hours in this view: {stats.averageStudyHours} hours / week.</section>
      <section className="chart-grid">
        <StudyHoursDistributionChart data={groups} />
        <StudyGroupPerformanceChart data={groups} />
        <StudyScatterChart records={records} />
      </section>
      <section className="stat-panel">
        <h3>Study-hour groups</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hours / week</th>
                <th>Students</th>
                <th>Avg performance</th>
                <th>Avg attendance</th>
                <th>Avg CGPA</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.studentCount}</td>
                  <td>{row.averageOverallScore.toFixed(2)}</td>
                  <td>{row.averageAttendance.toFixed(2)}%</td>
                  <td>{row.averageCgpa.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <DownloadBar query={query} />
    </AppShell>
  );
}
