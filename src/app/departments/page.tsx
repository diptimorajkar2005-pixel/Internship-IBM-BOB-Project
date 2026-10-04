import { DepartmentAttendanceChart, DepartmentPerformanceChart } from "@/components/Charts";
import { AppShell, PageHero } from "@/components/AppShell";
import { DownloadBar } from "@/components/DownloadBar";
import { Filters } from "@/components/Filters";
import { getDepartmentAnalysis, getDepartmentSectionAnalysis } from "@/lib/analytics";
import { IMAGES } from "@/lib/constants";
import { filterQueryString, getFilteredStudents, parseFilters } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const records = await getFilteredStudents(filters);
  const departments = getDepartmentAnalysis(records);
  const combos = getDepartmentSectionAnalysis(records);
  const selected = filters.department && filters.department !== "all"
    ? departments.find((row) => row.label === filters.department)
    : undefined;
  const query = filterQueryString(filters);

  return (
    <AppShell filters={filters}>
      <PageHero
        kicker="Departments"
        title="Department comparison"
        subtitle="Compare student count, performance, attendance, CGPA, and study hours across departments."
        image={IMAGES.courtyard}
      />
      <Filters />
      {selected ? (
        <section className="banner info">
          Selected department: {selected.label}. Average score {selected.averageOverallScore}, attendance{" "}
          {selected.averageAttendance}%, CGPA {selected.averageCgpa}, study hours {selected.averageStudyHours}, students{" "}
          {selected.studentCount}.
        </section>
      ) : (
        <section className="banner info">Use the department filter to focus on one programme.</section>
      )}
      <section className="chart-grid">
        <DepartmentPerformanceChart data={departments} />
        <DepartmentAttendanceChart data={departments} />
      </section>
      <section className="stat-panel">
        <h3>Department statistics</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Students</th>
                <th>Avg performance</th>
                <th>Avg attendance</th>
                <th>Avg CGPA</th>
                <th>Avg study hours</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.studentCount}</td>
                  <td>{row.averageOverallScore.toFixed(2)}</td>
                  <td>{row.averageAttendance.toFixed(2)}%</td>
                  <td>{row.averageCgpa.toFixed(2)}</td>
                  <td>{row.averageStudyHours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="stat-panel">
        <h3>Department + section</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Group</th>
                <th>Students</th>
                <th>Avg performance</th>
                <th>Avg attendance</th>
              </tr>
            </thead>
            <tbody>
              {combos.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.studentCount}</td>
                  <td>{row.averageOverallScore.toFixed(2)}</td>
                  <td>{row.averageAttendance.toFixed(2)}%</td>
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
