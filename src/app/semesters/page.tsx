import { SemesterCgpaChart, SemesterPerformanceChart } from "@/components/Charts";
import { AppShell, PageHero } from "@/components/AppShell";
import { DownloadBar } from "@/components/DownloadBar";
import { Filters } from "@/components/Filters";
import { getSemesterAnalysis } from "@/lib/analytics";
import { IMAGES } from "@/lib/constants";
import { filterQueryString, getFilteredStudents, parseFilters } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function SemestersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const records = await getFilteredStudents(filters);
  const semesters = getSemesterAnalysis(records);
  const selected = filters.semester && filters.semester !== "all"
    ? semesters.find((row) => row.label === `Semester ${filters.semester}`)
    : undefined;
  const query = filterQueryString(filters);

  return (
    <AppShell filters={filters}>
      <PageHero
        kicker="Semesters"
        title="Semester performance"
        subtitle="Track how average scores, attendance, CGPA, and headcount change from semester 1 to 8."
        image={IMAGES.gothic}
      />
      <Filters />
      {selected ? (
        <section className="banner info">
          {selected.label}: {selected.studentCount} students, average score {selected.averageOverallScore}, attendance{" "}
          {selected.averageAttendance}%, CGPA {selected.averageCgpa}.
        </section>
      ) : (
        <section className="banner info">Use the semester filter to inspect one term in detail.</section>
      )}
      <section className="chart-grid">
        <SemesterPerformanceChart data={semesters} />
        <SemesterCgpaChart data={semesters} />
      </section>
      <section className="stat-panel">
        <h3>Semester statistics</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Semester</th>
                <th>Students</th>
                <th>Avg score</th>
                <th>Avg attendance</th>
                <th>Avg CGPA</th>
                <th>Avg study hours</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((row) => (
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
      <DownloadBar query={query} />
    </AppShell>
  );
}
