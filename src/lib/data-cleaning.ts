import { REQUIRED_COLUMNS, type CleaningReport, type RawStudentRecord, type StudentRecord } from "@/lib/types";
import { enrichStudent, median, roundTo } from "@/lib/formulas";

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === "";
}

function parseNumber(value: string | undefined): number | null {
  if (isBlank(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value: number, min: number, max: number): { value: number; clamped: boolean } {
  if (value < min) return { value: min, clamped: true };
  if (value > max) return { value: max, clamped: true };
  return { value, clamped: false };
}

function columnMedian(rows: RawStudentRecord[], column: string): number {
  const values = rows
    .map((row) => parseNumber(row[column]))
    .filter((value): value is number => value !== null);
  return values.length > 0 ? median(values) : 0;
}

function modeOrDefault(rows: RawStudentRecord[], column: string, fallback: string): string {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = row[column]?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let best = fallback;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

export function cleanStudentRows(
  rows: RawStudentRecord[],
  extraColumns: string[] = [],
): { records: StudentRecord[]; report: CleaningReport } {
  const notes: string[] = [];
  let missingValuesHandled = 0;
  let invalidRecordsHandled = 0;
  let duplicateRowsRemoved = 0;
  let emptyRowsRemoved = 0;

  const nonEmptyRows = rows.filter((row) =>
    REQUIRED_COLUMNS.some((column) => !isBlank(row[column])),
  );
  emptyRowsRemoved = rows.length - nonEmptyRows.length;

  const medians = {
    attendance_percentage: columnMedian(nonEmptyRows, "attendance_percentage"),
    study_hours_per_week: columnMedian(nonEmptyRows, "study_hours_per_week"),
    assignment_score: columnMedian(nonEmptyRows, "assignment_score"),
    quiz_score: columnMedian(nonEmptyRows, "quiz_score"),
    midterm_score: columnMedian(nonEmptyRows, "midterm_score"),
    final_score: columnMedian(nonEmptyRows, "final_score"),
    previous_cgpa: columnMedian(nonEmptyRows, "previous_cgpa"),
    semester: Math.round(columnMedian(nonEmptyRows, "semester") || 1),
  };

  const defaultDepartment = modeOrDefault(nonEmptyRows, "department", "Computer Science");
  const defaultSection = modeOrDefault(nonEmptyRows, "section", "A");
  const defaultName = "Unknown Student";

  const seen = new Set<string>();
  const records: StudentRecord[] = [];

  nonEmptyRows.forEach((row, index) => {
    let studentId = row.student_id?.trim() ?? "";
    if (!studentId) {
      studentId = `TEMP${String(index + 1).padStart(4, "0")}`;
      missingValuesHandled += 1;
      notes.push(`Generated identifier ${studentId} for a row with a missing student ID.`);
    }

    if (seen.has(studentId)) {
      duplicateRowsRemoved += 1;
      return;
    }
    seen.add(studentId);

    let studentName = row.student_name?.trim() ?? "";
    if (!studentName) {
      studentName = defaultName;
      missingValuesHandled += 1;
    }

    let department = row.department?.trim() ?? "";
    if (!department) {
      department = defaultDepartment;
      missingValuesHandled += 1;
    }

    let section = (row.section?.trim() || defaultSection).toUpperCase();
    if (!["A", "B", "C", "D"].includes(section)) {
      section = defaultSection;
      invalidRecordsHandled += 1;
    }

    const numericFields: Array<{
      column: keyof typeof medians;
      min: number;
      max: number;
      digits: number;
    }> = [
      { column: "semester", min: 1, max: 8, digits: 0 },
      { column: "attendance_percentage", min: 0, max: 100, digits: 2 },
      { column: "study_hours_per_week", min: 0, max: 50, digits: 2 },
      { column: "assignment_score", min: 0, max: 100, digits: 2 },
      { column: "quiz_score", min: 0, max: 100, digits: 2 },
      { column: "midterm_score", min: 0, max: 100, digits: 2 },
      { column: "final_score", min: 0, max: 100, digits: 2 },
      { column: "previous_cgpa", min: 0, max: 10, digits: 2 },
    ];

    const numericValues: Record<string, number> = {};
    for (const field of numericFields) {
      const parsed = parseNumber(row[field.column]);
      if (parsed === null) {
        numericValues[field.column] = roundTo(medians[field.column], field.digits);
        missingValuesHandled += 1;
        continue;
      }
      const clamped = clamp(parsed, field.min, field.max);
      if (clamped.clamped) invalidRecordsHandled += 1;
      numericValues[field.column] = roundTo(clamped.value, field.digits);
    }

    records.push(
      enrichStudent({
        studentId,
        studentName,
        department,
        semester: numericValues.semester,
        section,
        attendancePercentage: numericValues.attendance_percentage,
        studyHoursPerWeek: numericValues.study_hours_per_week,
        assignmentScore: numericValues.assignment_score,
        quizScore: numericValues.quiz_score,
        midtermScore: numericValues.midterm_score,
        finalScore: numericValues.final_score,
        previousCgpa: numericValues.previous_cgpa,
      }),
    );
  });

  if (emptyRowsRemoved > 0) {
    notes.push(`Removed ${emptyRowsRemoved} completely empty row(s).`);
  }
  if (duplicateRowsRemoved > 0) {
    notes.push(`Kept the first occurrence of ${duplicateRowsRemoved} duplicate student ID(s).`);
  }
  if (missingValuesHandled > 0) {
    notes.push(`Filled ${missingValuesHandled} missing value(s) using medians or most common categories.`);
  }
  if (invalidRecordsHandled > 0) {
    notes.push(`Adjusted ${invalidRecordsHandled} out-of-range or invalid value(s) instead of dropping those students.`);
  }
  if (notes.length === 0) {
    notes.push("No cleaning adjustments were required. Dataset values were already within expected ranges.");
  }

  return {
    records,
    report: {
      rowsBefore: rows.length,
      rowsAfter: records.length,
      duplicateRowsRemoved,
      missingValuesHandled,
      invalidRecordsHandled,
      extraColumnsIgnored: extraColumns.length,
      emptyRowsRemoved,
      notes,
    },
  };
}
