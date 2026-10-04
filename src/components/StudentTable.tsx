import Link from "next/link";
import type { StudentRecord } from "@/lib/types";

type Props = {
  records: StudentRecord[];
  query: string;
  selectedId?: string;
  compact?: boolean;
};

export function StudentTable({ records, query, selectedId, compact = false }: Props) {
  const rows = compact ? records.slice(0, 12) : records;

  if (records.length === 0) {
    return (
      <div className="empty-card">
        <h3>No matching students</h3>
        <p>Try clearing filters or widening the attendance and study-hour ranges.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Sem</th>
            <th>Sec</th>
            <th>Attendance</th>
            <th>Overall</th>
            <th>Grade</th>
            <th>Category</th>
            <th>Attention</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
            params.set("student", row.studentId);
            return (
              <tr key={row.studentId} className={selectedId === row.studentId ? "selected" : undefined}>
                <td>
                  <Link href={`?${params.toString()}`}>{row.studentId}</Link>
                </td>
                <td>{row.studentName}</td>
                <td>{row.department}</td>
                <td>{row.semester}</td>
                <td>{row.section}</td>
                <td>{row.attendancePercentage.toFixed(1)}%</td>
                <td>{row.overallScore.toFixed(2)}</td>
                <td>{row.grade}</td>
                <td>{row.performanceCategory}</td>
                <td>
                  <span className={row.academicAttention === "Yes" ? "pill warn" : "pill ok"}>
                    {row.academicAttention}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {compact && records.length > rows.length ? (
        <p className="muted small">Showing {rows.length} of {records.length} students. Open Student Performance for the full table.</p>
      ) : (
        <p className="muted small">{records.length} student{records.length === 1 ? "" : "s"} in the current filter.</p>
      )}
    </div>
  );
}
