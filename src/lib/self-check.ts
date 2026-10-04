import { adaptDataset } from "@/lib/adapter";
import { cleanStudentRows } from "@/lib/data-cleaning";
import { applyFilters, getDepartmentAnalysis, getOverallStatistics, getSemesterAnalysis } from "@/lib/analytics";
import {
  calculateOverallScore,
  getAcademicAttention,
  getGrade,
  getPerformanceCategory,
} from "@/lib/formulas";
import { generateStudentDataset } from "@/lib/generate-dataset";
import { parseCsv } from "@/lib/csv";
import { validateDataset } from "@/lib/validators";
import { REQUIRED_COLUMNS } from "@/lib/types";

type CheckResult = { name: string; passed: boolean; detail: string };

function expectEqual(name: string, actual: unknown, expected: unknown): CheckResult {
  const passed = Object.is(actual, expected) || actual === expected;
  return { name, passed, detail: passed ? "ok" : `expected ${String(expected)}, received ${String(actual)}` };
}

function expectTrue(name: string, condition: boolean, detail: string): CheckResult {
  return { name, passed: condition, detail: condition ? "ok" : detail };
}

export function runSelfChecks(): { passed: number; failed: number; results: CheckResult[] } {
  const results: CheckResult[] = [];

  results.push(expectEqual("overall score 100s", calculateOverallScore({
    assignmentScore: 100,
    quizScore: 100,
    midtermScore: 100,
    finalScore: 100,
  }), 100));

  results.push(expectEqual(
    "overall score weighted mix",
    calculateOverallScore({ assignmentScore: 80, quizScore: 70, midtermScore: 60, finalScore: 50 }),
    60.5,
  ));

  results.push(expectEqual("category excellent", getPerformanceCategory(90), "Excellent"));
  results.push(expectEqual("category good", getPerformanceCategory(75), "Good"));
  results.push(expectEqual("category average", getPerformanceCategory(60), "Average"));
  results.push(expectEqual("category needs improvement", getPerformanceCategory(59.99), "Needs Improvement"));

  results.push(expectEqual("grade A+", getGrade(91), "A+"));
  results.push(expectEqual("grade A", getGrade(80), "A"));
  results.push(expectEqual("grade B", getGrade(70), "B"));
  results.push(expectEqual("grade C", getGrade(60), "C"));
  results.push(expectEqual("grade D", getGrade(50), "D"));
  results.push(expectEqual("grade F", getGrade(49.9), "F"));

  const attention = getAcademicAttention({ overallScore: 55, attendancePercentage: 70, finalScore: 40 });
  results.push(expectEqual("attention flag", attention.academicAttention, "Yes"));
  results.push(expectTrue(
    "attention reasons combined",
    attention.attentionReason.includes("Low overall performance") &&
      attention.attentionReason.includes("Low attendance") &&
      attention.attentionReason.includes("Low final examination score"),
    attention.attentionReason,
  ));

  const none = getAcademicAttention({ overallScore: 80, attendancePercentage: 90, finalScore: 75 });
  results.push(expectEqual("no attention needed", none.academicAttention, "No"));

  const generated = generateStudentDataset(520, 42);
  const ids = new Set(generated.map((row) => row.studentId));
  results.push(expectTrue("dataset size", generated.length >= 500, `size=${generated.length}`));
  results.push(expectTrue("unique student IDs", ids.size === generated.length, `unique=${ids.size}`));
  results.push(expectEqual("first student id", generated[0].studentId, "STU1001"));

  const stats = getOverallStatistics(generated);
  results.push(expectTrue("average score in range", stats.averageOverallScore > 0 && stats.averageOverallScore <= 100, String(stats.averageOverallScore)));
  results.push(expectTrue("department groups exist", getDepartmentAnalysis(generated).length === 5, "expected 5 departments"));
  results.push(expectTrue("semester groups exist", getSemesterAnalysis(generated).length === 8, "expected 8 semesters"));

  const filtered = applyFilters(generated, { department: "Computer Science", semester: "1" });
  results.push(expectTrue(
    "filters reduce rows",
    filtered.length > 0 && filtered.every((row) => row.department === "Computer Science" && row.semester === 1),
    `filtered=${filtered.length}`,
  ));

  const missingCols = validateDataset(["student_id"], []);
  results.push(expectTrue("validator empty + missing cols", missingCols.ok === false, "should fail"));

  const invalidScores = validateDataset(
    [
      "student_id", "student_name", "department", "semester", "section",
      "attendance_percentage", "study_hours_per_week", "assignment_score",
      "quiz_score", "midterm_score", "final_score", "previous_cgpa",
    ],
    [{
      student_id: "STU1",
      student_name: "Test",
      department: "Computer Science",
      semester: "2",
      section: "A",
      attendance_percentage: "120",
      study_hours_per_week: "10",
      assignment_score: "-5",
      quiz_score: "80",
      midterm_score: "70",
      final_score: "60",
      previous_cgpa: "12",
    }],
  );
  results.push(expectTrue("validator range warnings", invalidScores.issues.some((issue) => issue.message.includes("Attendance")), "missing attendance warning"));

  const cleaned = cleanStudentRows([
    {
      student_id: "STU1",
      student_name: "Ada",
      department: "Computer Science",
      semester: "2",
      section: "A",
      attendance_percentage: "90",
      study_hours_per_week: "12",
      assignment_score: "80",
      quiz_score: "80",
      midterm_score: "80",
      final_score: "80",
      previous_cgpa: "8",
    },
    {
      student_id: "STU1",
      student_name: "Ada Duplicate",
      department: "Computer Science",
      semester: "2",
      section: "A",
      attendance_percentage: "90",
      study_hours_per_week: "12",
      assignment_score: "80",
      quiz_score: "80",
      midterm_score: "80",
      final_score: "80",
      previous_cgpa: "8",
    },
    {
      student_id: "STU2",
      student_name: "Lin",
      department: "Electronics",
      semester: "9",
      section: "Z",
      attendance_percentage: "",
      study_hours_per_week: "99",
      assignment_score: "110",
      quiz_score: "-2",
      midterm_score: "70",
      final_score: "70",
      previous_cgpa: "11",
    },
  ]);
  results.push(expectEqual("duplicate removed", cleaned.report.duplicateRowsRemoved, 1));
  results.push(expectTrue("invalid values handled", cleaned.report.invalidRecordsHandled > 0, "expected clamps"));
  results.push(expectTrue("missing values handled", cleaned.report.missingValuesHandled > 0, "expected fills"));
  results.push(expectTrue("cleaned row count", cleaned.records.length === 2, `rows=${cleaned.records.length}`));

  const parsed = parseCsv("student_id,student_name\nSTU9,\"Last, First\"\n");
  results.push(expectTrue("csv quoted comma", parsed.rows[0]?.student_name === "Last, First", parsed.rows[0]?.student_name ?? "empty"));

  // Adapter handles the Kaggle "Student Performance" schema.
  const kaggleHeaders = [
    "Hours Studied",
    "Previous Scores",
    "Extracurricular Activities",
    "Sleep Hours",
    "Sample Question Papers Practiced",
    "Performance Index",
  ];
  const kaggleRows = [
    {
      "Hours Studied": "7",
      "Previous Scores": "99",
      "Extracurricular Activities": "Yes",
      "Sleep Hours": "9",
      "Sample Question Papers Practiced": "1",
      "Performance Index": "91",
    },
    {
      "Hours Studied": "4",
      "Previous Scores": "82",
      "Extracurricular Activities": "No",
      "Sleep Hours": "4",
      "Sample Question Papers Practiced": "2",
      "Performance Index": "65",
    },
  ];
  const adaptedKaggle = adaptDataset(kaggleHeaders, kaggleRows);
  results.push(expectTrue("adapter adapts kaggle", adaptedKaggle.adapted, "expected adaptation"));
  results.push(expectTrue(
    "adapter produces required columns",
    REQUIRED_COLUMNS.every((col) => adaptedKaggle.rows[0]?.[col] !== undefined),
    "missing required column after adaptation",
  ));
  const adaptedValidation = validateDataset(adaptedKaggle.headers, adaptedKaggle.rows);
  results.push(expectTrue("adapted kaggle validates", adaptedValidation.ok, "adapted data should validate"));
  results.push(expectEqual("adapter maps final from performance index", adaptedKaggle.rows[0]?.final_score, "91"));

  // Alternate but fully compliant headers get canonicalized.
  const aliasHeaders = [
    "id", "name", "branch", "sem", "sec", "attendance", "study_hours",
    "assignment", "quiz", "midterm", "final", "cgpa",
  ];
  const aliasRows = [{
    id: "R1", name: "Alias Student", branch: "Electronics", sem: "4", sec: "B",
    attendance: "80", study_hours: "12", assignment: "70", quiz: "72",
    midterm: "68", final: "74", cgpa: "7.5",
  }];
  const adaptedAlias = adaptDataset(aliasHeaders, aliasRows);
  results.push(expectTrue("alias validates", validateDataset(adaptedAlias.headers, adaptedAlias.rows).ok, "alias should validate"));

  // Totally unrelated file is not force-adapted.
  const unrelated = adaptDataset(["city", "temperature", "humidity"], [{ city: "X", temperature: "30", humidity: "40" }]);
  results.push(expectTrue("unrelated not adapted", unrelated.adapted === false, "should not adapt unrelated file"));

  const passed = results.filter((result) => result.passed).length;
  return { passed, failed: results.length - passed, results };
}
