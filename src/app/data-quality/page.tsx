import { AppShell, PageHero } from "@/components/AppShell";
import { DownloadBar } from "@/components/DownloadBar";
import { Filters } from "@/components/Filters";
import { UploadPanel } from "@/components/UploadPanel";
import { IMAGES } from "@/lib/constants";
import { filterQueryString, getAllStudents, getCleaningHistory, getLatestCleaningReport, parseFilters } from "@/lib/repository";
import { runSelfChecks } from "@/lib/self-check";
import type { StudentRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DataQualityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const records = await getAllStudents();
  const latest = await getLatestCleaningReport();
  const history = await getCleaningHistory();
  const checks = runSelfChecks();
  const query = filterQueryString(filters);

  const numericKeys: Array<keyof StudentRecord> = [
    "attendancePercentage",
    "studyHoursPerWeek",
    "assignmentScore",
    "quizScore",
    "midtermScore",
    "finalScore",
    "previousCgpa",
  ];

  return (
    <AppShell filters={filters}>
      <PageHero
        kicker="Preprocessing"
        title="Data Quality"
        subtitle="Inspect row counts, types, cleaning operations, and built-in analytics checks before trusting the charts."
        image={IMAGES.courtyard}
      />
      <UploadPanel />
      <Filters />
      <section className="stat-grid">
        <article className="stat-panel">
          <h3>Current dataset</h3>
          <ul>
            <li>Rows: {records.length}</li>
            <li>Columns stored: 18 (12 source + 6 calculated)</li>
            <li>Missing values in live table: 0 (cleaning fills or rejects before insert)</li>
            <li>Duplicate student IDs: {records.length - new Set(records.map((row) => row.studentId)).size}</li>
          </ul>
        </article>
        <article className="stat-panel">
          <h3>Latest cleaning report</h3>
          {latest ? (
            <ul>
              <li>Source: {latest.source}</li>
              <li>Rows before: {latest.rowsBefore}</li>
              <li>Rows after: {latest.rowsAfter}</li>
              <li>Duplicate rows removed: {latest.duplicateRowsRemoved}</li>
              <li>Missing values handled: {latest.missingValuesHandled}</li>
              <li>Invalid records handled: {latest.invalidRecordsHandled}</li>
              <li>Extra columns ignored: {latest.extraColumnsIgnored}</li>
              <li>Notes: {latest.notes}</li>
            </ul>
          ) : (
            <p>No cleaning report has been saved yet.</p>
          )}
        </article>
      </section>
      <section className="stat-panel">
        <h3>Column types</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Sample</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>student_id</td><td>text</td><td>{records[0]?.studentId ?? "—"}</td></tr>
              <tr><td>student_name</td><td>text</td><td>{records[0]?.studentName ?? "—"}</td></tr>
              <tr><td>department</td><td>text</td><td>{records[0]?.department ?? "—"}</td></tr>
              <tr><td>semester</td><td>integer 1–8</td><td>{records[0]?.semester ?? "—"}</td></tr>
              {numericKeys.map((key) => (
                <tr key={String(key)}>
                  <td>{String(key)}</td>
                  <td>numeric</td>
                  <td>{records[0] ? String(records[0][key]) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="stat-panel">
        <h3>Cleaning history</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Source</th>
                <th>Before</th>
                <th>After</th>
                <th>Duplicates</th>
                <th>Missing</th>
                <th>Invalid</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id}>
                  <td>{row.createdAt.toISOString()}</td>
                  <td>{row.source}</td>
                  <td>{row.rowsBefore}</td>
                  <td>{row.rowsAfter}</td>
                  <td>{row.duplicateRowsRemoved}</td>
                  <td>{row.missingValuesHandled}</td>
                  <td>{row.invalidRecordsHandled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className={`banner ${checks.failed === 0 ? "success" : "error"}`}>
        Built-in analytics checks: {checks.passed} passed, {checks.failed} failed.
      </section>
      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Check</th>
              <th>Result</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {checks.results.map((result) => (
              <tr key={result.name}>
                <td>{result.name}</td>
                <td>{result.passed ? "Pass" : "Fail"}</td>
                <td>{result.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <DownloadBar query={query} />
    </AppShell>
  );
}
