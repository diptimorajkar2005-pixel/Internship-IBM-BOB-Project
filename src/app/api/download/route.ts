import {
  getDepartmentAnalysis,
  getOverallStatistics,
  getSemesterAnalysis,
  getStudentsRequiringAttention,
} from "@/lib/analytics";
import { objectsToCsv, recordsToCsv } from "@/lib/csv";
import { getFilteredStudents, parseFilters } from "@/lib/repository";

export const dynamic = "force-dynamic";

function csvResponse(filename: string, content: string) {
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind") ?? "filtered";
  const raw: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    if (key !== "kind") raw[key] = value;
  });
  if (kind === "template") {
    const header =
      "student_id,student_name,department,semester,section,attendance_percentage,study_hours_per_week,assignment_score,quiz_score,midterm_score,final_score,previous_cgpa";
    const sample = [
      "STU1001,Aarav Sharma,Computer Science,1,A,88,18,82,79,75,81,8.1",
      "STU1002,Diya Patel,Electronics,3,B,72,10,65,60,58,55,6.4",
      "STU1003,Rohan Nair,Mechanical,5,C,95,25,90,88,91,93,9.0",
    ];
    return csvResponse("student_performance_template.csv", `${header}\n${sample.join("\n")}\n`);
  }

  const filters = parseFilters(raw);
  const records = await getFilteredStudents(filters);

  if (kind === "filtered") {
    return csvResponse("filtered_students.csv", recordsToCsv(records));
  }

  if (kind === "attention") {
    return csvResponse("academic_attention.csv", recordsToCsv(getStudentsRequiringAttention(records)));
  }

  if (kind === "summary") {
    const stats = getOverallStatistics(records);
    return csvResponse(
      "summary_statistics.csv",
      objectsToCsv(Object.entries(stats).map(([metric, value]) => ({ metric, value }))),
    );
  }

  if (kind === "department") {
    return csvResponse(
      "department_analysis.csv",
      objectsToCsv(
        getDepartmentAnalysis(records).map((row) => ({
          label: row.label,
          studentCount: row.studentCount,
          averageOverallScore: row.averageOverallScore,
          averageAttendance: row.averageAttendance,
          averageCgpa: row.averageCgpa,
          averageStudyHours: row.averageStudyHours,
        })),
      ),
    );
  }

  if (kind === "semester") {
    return csvResponse(
      "semester_analysis.csv",
      objectsToCsv(
        getSemesterAnalysis(records).map((row) => ({
          label: row.label,
          studentCount: row.studentCount,
          averageOverallScore: row.averageOverallScore,
          averageAttendance: row.averageAttendance,
          averageCgpa: row.averageCgpa,
          averageStudyHours: row.averageStudyHours,
        })),
      ),
    );
  }

  return Response.json({ ok: false, message: "Unknown download type." }, { status: 404 });
}
