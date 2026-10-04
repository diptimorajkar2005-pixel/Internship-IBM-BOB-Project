import { AppShell, PageHero } from "@/components/AppShell";
import { DownloadBar } from "@/components/DownloadBar";
import { Filters } from "@/components/Filters";
import { getStudentsRequiringAttention } from "@/lib/analytics";
import { IMAGES } from "@/lib/constants";
import { filterQueryString, getFilteredStudents, parseFilters } from "@/lib/repository";
import type { StudentRecord } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

function sortRecords(records: StudentRecord[], sort: string | undefined) {
  const copy = [...records];
  if (sort === "attendance") copy.sort((a, b) => a.attendancePercentage - b.attendancePercentage);
  else if (sort === "final") copy.sort((a, b) => a.finalScore - b.finalScore);
  else if (sort === "name") copy.sort((a, b) => a.studentName.localeCompare(b.studentName));
  else copy.sort((a, b) => a.overallScore - b.overallScore);
  return copy;
}

export default async function AttentionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const records = await getFilteredStudents(filters);
  const flagged = getStudentsRequiringAttention(records);
  const sort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const rows = sortRecords(flagged, sort);
  const query = filterQueryString(filters);
  const sortLink = (value: string) => {
    const qs = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
    qs.set("sort", value);
    return `/attention?${qs.toString()}`;
  };

  return (
    <AppShell filters={filters}>
      <PageHero
        kicker="Support"
        title="Students Requiring Academic Attention"
        subtitle="Support-focused flags for low overall performance, low attendance, or a low final examination score."
        image={IMAGES.library}
      />
      <Filters showSearch />
      <section className="stat-panel">
        <h3>Criteria used</h3>
        <p>
          A student is listed when overall_score &lt; 60 <strong>OR</strong> attendance_percentage &lt; 75{" "}
          <strong>OR</strong> final_score &lt; 50. Labels are support-oriented, never insulting.
        </p>
        <p className="muted">{rows.length} student(s) currently require academic attention in this view.</p>
        <div className="download-actions">
          <Link className="ghost-btn" href={sortLink("score")}>Sort by overall score</Link>
          <Link className="ghost-btn" href={sortLink("attendance")}>Sort by attendance</Link>
          <Link className="ghost-btn" href={sortLink("final")}>Sort by final score</Link>
          <Link className="ghost-btn" href={sortLink("name")}>Sort by name</Link>
        </div>
      </section>
      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Attendance</th>
              <th>Overall Score</th>
              <th>Final Score</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>No students require academic attention in the current filter.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.studentId}>
                  <td>{row.studentId}</td>
                  <td>{row.studentName}</td>
                  <td>{row.department}</td>
                  <td>{row.semester}</td>
                  <td>{row.attendancePercentage.toFixed(1)}%</td>
                  <td>{row.overallScore.toFixed(2)}</td>
                  <td>{row.finalScore.toFixed(2)}</td>
                  <td>{row.attentionReason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <DownloadBar query={query} />
    </AppShell>
  );
}
