import { AttendanceDistributionChart, AttendanceScatterChart } from "@/components/Charts";
import { AppShell, PageHero } from "@/components/AppShell";
import { DownloadBar } from "@/components/DownloadBar";
import { Filters } from "@/components/Filters";
import { StudentTable } from "@/components/StudentTable";
import { getAttendanceAnalysis, getOverallStatistics } from "@/lib/analytics";
import { IMAGES } from "@/lib/constants";
import { filterQueryString, getFilteredStudents, parseFilters } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const records = await getFilteredStudents(filters);
  const stats = getOverallStatistics(records);
  const groups = getAttendanceAnalysis(records);
  const below75 = records.filter((row) => row.attendancePercentage < 75);
  const query = filterQueryString(filters);

  return (
    <AppShell filters={filters}>
      <PageHero
        kicker="Attendance"
        title="Attendance patterns"
        subtitle="Review attendance categories, compare them with performance, and list students below 75%."
        image={IMAGES.lecture}
      />
      <Filters />
      <section className="kpi-grid">
        <article className="kpi-card tone-gold">
          <div>
            <p>Average attendance</p>
            <strong>{stats.averageAttendance.toFixed(2)}%</strong>
          </div>
        </article>
        <article className="kpi-card tone-wine">
          <div>
            <p>Below 75%</p>
            <strong>{below75.length}</strong>
          </div>
        </article>
      </section>
      <section className="chart-grid">
        <AttendanceDistributionChart data={groups} />
        <AttendanceScatterChart records={records} />
      </section>
      <section className="stat-panel">
        <h3>Attendance categories</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Students</th>
                <th>Average performance</th>
                <th>Average CGPA</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.label}>
                  <td>{group.label}</td>
                  <td>{group.studentCount}</td>
                  <td>{group.averageOverallScore.toFixed(2)}</td>
                  <td>{group.averageCgpa.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="stat-panel">
        <h3>Students below 75% attendance</h3>
        <StudentTable records={below75} query={query} compact />
      </section>
      <DownloadBar query={query} />
    </AppShell>
  );
}
