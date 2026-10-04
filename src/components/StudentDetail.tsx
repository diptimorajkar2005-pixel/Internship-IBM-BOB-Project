import type { StudentRecord } from "@/lib/types";

export function StudentDetail({ student }: { student: StudentRecord | undefined }) {
  if (!student) {
    return (
      <article className="detail-card">
        <p className="eyebrow">Student profile</p>
        <h3>Select a student</h3>
        <p className="muted">Choose a student from the table to view attendance, assessments, grade, and attention status.</p>
      </article>
    );
  }

  const metrics = [
    ["Attendance", `${student.attendancePercentage.toFixed(2)}%`],
    ["Study hours / week", student.studyHoursPerWeek.toFixed(2)],
    ["Assignment", student.assignmentScore.toFixed(2)],
    ["Quiz", student.quizScore.toFixed(2)],
    ["Midterm", student.midtermScore.toFixed(2)],
    ["Final", student.finalScore.toFixed(2)],
    ["Previous CGPA", student.previousCgpa.toFixed(2)],
    ["Overall score", student.overallScore.toFixed(2)],
    ["Grade", student.grade],
    ["Category", student.performanceCategory],
  ];

  return (
    <article className="detail-card">
      <p className="eyebrow">{student.studentId}</p>
      <h3>{student.studentName}</h3>
      <p className="muted">
        {student.department} · Semester {student.semester} · Section {student.section}
      </p>
      <div className="metric-list">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className={student.academicAttention === "Yes" ? "banner info" : "banner success"}>
        {student.academicAttention === "Yes"
          ? `Requires Academic Attention — ${student.attentionReason}`
          : "No academic-attention flag on the current criteria."}
      </div>
    </article>
  );
}
