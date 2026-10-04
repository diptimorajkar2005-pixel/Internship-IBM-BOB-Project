import { REQUIRED_COLUMNS } from "@/lib/types";
import type { RawStudentRecord, ValidationIssue, ValidationResult } from "@/lib/types";

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === "";
}

function toNumber(value: string): number | null {
  if (isBlank(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateDataset(headers: string[], rows: RawStudentRecord[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const normalizedHeaders = headers.map((header) => header.trim());
  const headerSet = new Set(normalizedHeaders);

  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headerSet.has(column));
  const extraColumns = normalizedHeaders.filter(
    (header) => !REQUIRED_COLUMNS.includes(header as (typeof REQUIRED_COLUMNS)[number]) && header !== "",
  );

  if (normalizedHeaders.length === 0 || rows.length === 0) {
    issues.push({ level: "error", message: "The dataset is empty. Please upload a CSV with student rows." });
  }

  if (missingColumns.length > 0) {
    issues.push({
      level: "error",
      message: `Missing required columns: ${missingColumns.join(", ")}.`,
    });
  }

  if (extraColumns.length > 0) {
    issues.push({
      level: "warning",
      message: `Extra columns will be ignored: ${extraColumns.join(", ")}.`,
    });
  }

  if (missingColumns.length > 0 || rows.length === 0) {
    return { ok: false, issues, extraColumns };
  }

  const seenIds = new Map<string, number>();
  let invalidTypeCount = 0;
  let nullCount = 0;
  let rangeIssueCount = 0;

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const studentId = row.student_id?.trim() ?? "";

    for (const column of REQUIRED_COLUMNS) {
      if (isBlank(row[column])) {
        nullCount += 1;
      }
    }

    if (studentId) {
      const previous = seenIds.get(studentId);
      if (previous) {
        issues.push({
          level: "warning",
          message: `Duplicate student ID ${studentId} on row ${rowNumber} (also seen on row ${previous}).`,
        });
      } else {
        seenIds.set(studentId, rowNumber);
      }
    }

    const numericChecks: Array<{ column: string; min: number; max: number; label: string }> = [
      { column: "attendance_percentage", min: 0, max: 100, label: "Attendance" },
      { column: "study_hours_per_week", min: 0, max: 50, label: "Study hours" },
      { column: "assignment_score", min: 0, max: 100, label: "Assignment score" },
      { column: "quiz_score", min: 0, max: 100, label: "Quiz score" },
      { column: "midterm_score", min: 0, max: 100, label: "Midterm score" },
      { column: "final_score", min: 0, max: 100, label: "Final score" },
      { column: "previous_cgpa", min: 0, max: 10, label: "Previous CGPA" },
      { column: "semester", min: 1, max: 8, label: "Semester" },
    ];

    for (const check of numericChecks) {
      const raw = row[check.column];
      if (isBlank(raw)) continue;
      const value = toNumber(raw);
      if (value === null) {
        invalidTypeCount += 1;
        if (invalidTypeCount <= 8) {
          issues.push({
            level: "warning",
            message: `Row ${rowNumber}: ${check.label} is not a valid number (${raw}).`,
          });
        }
      } else if (value < check.min || value > check.max) {
        rangeIssueCount += 1;
        if (rangeIssueCount <= 8) {
          issues.push({
            level: "warning",
            message: `Row ${rowNumber}: ${check.label} is outside ${check.min}–${check.max} (${value}).`,
          });
        }
      }
    }
  });

  if (nullCount > 0) {
    issues.push({
      level: "warning",
      message: `${nullCount} missing value(s) were found and will be handled during cleaning.`,
    });
  }
  if (invalidTypeCount > 8) {
    issues.push({
      level: "warning",
      message: `${invalidTypeCount} invalid numeric value(s) were found.`,
    });
  }
  if (rangeIssueCount > 8) {
    issues.push({
      level: "warning",
      message: `${rangeIssueCount} out-of-range value(s) were found.`,
    });
  }

  const hasBlockingError = issues.some((issue) => issue.level === "error");
  return { ok: !hasBlockingError, issues, extraColumns };
}

export function describeValidation(result: ValidationResult): string {
  if (result.issues.length === 0) return "Dataset passed all validation checks.";
  return result.issues.map((issue) => `${issue.level.toUpperCase()}: ${issue.message}`).join("\n");
}
