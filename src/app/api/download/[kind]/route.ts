import {
  getAttendanceAnalysis,
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

export async function GET(
  request: Request,
  context: { params: Promise<{ kind: string }> },
) {
  const { kind } = await context.params;
  const url = new URL(request.url);
  const raw: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    raw[key] = value;
  });
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
      objectsToCsv(
        Object.entries(stats).map(([metric, value]) => ({ metric, value })),
      ),
    );
  }

  if (kind === "department") {
    return csvResponse(
      "department_analysis.csv",
      objectsToCsv(getDepartmentAnalysis(records) as unknown as Array<Record<string, string | number>>),
    );
  }

  if (kind === "semester") {
    return csvResponse(
      "semester_analysis.csv",
      objectsToCsv(getSemesterAnalysis(records) as unknown as Array<Record<string, string | number>>),
    );
  }

  if (kind === "attendance") {
    return csvResponse(
      "attendance_analysis.csv",
      objectsToCsv(getAttendanceAnalysis(records) as unknown as Array<Record<string, string | number>>),
    );
  }

  return Response.json({ ok: false, message: "Unknown download type." }, { status: 404 });
}
