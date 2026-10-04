import { DEPARTMENTS, SECTIONS } from "@/lib/constants";
import { REQUIRED_COLUMNS, type RawStudentRecord } from "@/lib/types";

/**
 * Smart CSV adapter.
 *
 * Many public datasets (for example the Kaggle "Student Performance" file with
 * columns like "Hours Studied", "Previous Scores", "Performance Index") do not
 * use the exact column names this dashboard expects. This adapter recognizes
 * common alternate names, maps what it can, and transparently derives the
 * remaining academic fields so the upload still works. Every derivation is
 * reported back to the user so nothing is hidden.
 */

const SYNONYMS: Record<(typeof REQUIRED_COLUMNS)[number], string[]> = {
  student_id: ["student_id", "id", "roll_no", "roll_number", "student_no", "reg_no", "registration_no"],
  student_name: ["student_name", "name", "full_name", "student"],
  department: ["department", "dept", "branch", "stream", "course"],
  semester: ["semester", "sem", "term"],
  section: ["section", "sec", "class_section", "div", "division"],
  attendance_percentage: ["attendance_percentage", "attendance", "attendance_percent", "attendance_rate"],
  study_hours_per_week: [
    "study_hours_per_week",
    "study_hours",
    "hours_studied",
    "weekly_study_hours",
    "study_time",
    "studytime",
  ],
  assignment_score: ["assignment_score", "assignment", "assignments", "assignment_marks"],
  quiz_score: ["quiz_score", "quiz", "quizzes", "quiz_marks"],
  midterm_score: ["midterm_score", "midterm", "mid_term", "mid_term_score", "mid_marks", "internal_marks"],
  final_score: ["final_score", "final", "final_exam", "final_marks", "performance_index", "exam_score", "g3"],
  previous_cgpa: ["previous_cgpa", "cgpa", "gpa", "previous_gpa", "prev_cgpa"],
};

export type AdaptResult = {
  headers: string[];
  rows: RawStudentRecord[];
  adapted: boolean;
  notes: string[];
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[%()]/g, "")
    .replace(/[\s./-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function toNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function adaptDataset(headers: string[], rows: RawStudentRecord[]): AdaptResult {
  const normToOriginal = new Map<string, string>();
  for (const header of headers) {
    const norm = normalizeHeader(header);
    if (norm && !normToOriginal.has(norm)) normToOriginal.set(norm, header);
  }

  // Map each required column to an existing source column (if any).
  const mapping = new Map<(typeof REQUIRED_COLUMNS)[number], string>();
  for (const required of REQUIRED_COLUMNS) {
    for (const candidate of SYNONYMS[required]) {
      if (normToOriginal.has(candidate)) {
        mapping.set(required, normToOriginal.get(candidate)!);
        break;
      }
    }
  }

  // Extra numeric signals that help derive academic fields.
  const previousScoresCol = normToOriginal.get("previous_scores");
  const samplePapersCol = normToOriginal.get("sample_question_papers_practiced");

  const missing = REQUIRED_COLUMNS.filter((required) => !mapping.has(required));

  // Already fully compliant (exact or alias). Just canonicalize header names.
  if (missing.length === 0) {
    const canonicalRows = rows.map((row) => {
      const next: RawStudentRecord = {};
      for (const required of REQUIRED_COLUMNS) {
        next[required] = row[mapping.get(required)!] ?? "";
      }
      return next;
    });
    const renamed = [...mapping.entries()].some(([required, original]) => normalizeHeader(original) !== required);
    return {
      headers: [...REQUIRED_COLUMNS],
      rows: canonicalRows,
      adapted: renamed,
      notes: renamed ? ["Recognized alternate column names and mapped them to the standard schema."] : [],
    };
  }

  // Decide whether we have enough signal to adapt. We need at least one
  // recognizable academic indicator, otherwise the file is unrelated.
  const hasSignal =
    mapping.has("final_score") ||
    mapping.has("study_hours_per_week") ||
    mapping.has("previous_cgpa") ||
    mapping.has("assignment_score") ||
    mapping.has("quiz_score") ||
    mapping.has("midterm_score") ||
    mapping.has("attendance_percentage") ||
    previousScoresCol !== undefined ||
    samplePapersCol !== undefined;

  if (!hasSignal) {
    return { headers, rows, adapted: false, notes: [] };
  }

  const derivedColumns = new Set<string>();
  const mappedColumns: string[] = [];
  for (const [required, original] of mapping.entries()) {
    mappedColumns.push(`${original} → ${required}`);
  }

  const adaptedRows: RawStudentRecord[] = rows.map((row, index) => {
    const num = (required: (typeof REQUIRED_COLUMNS)[number]) =>
      mapping.has(required) ? toNumber(row[mapping.get(required)!]) : null;

    const previousScores = previousScoresCol ? toNumber(row[previousScoresCol]) : null;
    const samplePapers = samplePapersCol ? toNumber(row[samplePapersCol]) : null;

    const finalFromFile = num("final_score");
    const assignmentFromFile = num("assignment_score");
    const quizFromFile = num("quiz_score");
    const midtermFromFile = num("midterm_score");
    const cgpaFromFile = num("previous_cgpa");

    // Build a base academic signal (0–100) from whatever is available.
    const signals = [finalFromFile, previousScores, assignmentFromFile, quizFromFile, midtermFromFile].filter(
      (value): value is number => value !== null,
    );
    const base = signals.length > 0 ? signals.reduce((a, b) => a + b, 0) / signals.length : 65;

    // Deterministic jitter so derived values vary realistically but reproducibly.
    const jitter = (((index * 37 + 11) % 21) - 10) / 2; // -5 .. +5

    const finalScore = finalFromFile ?? clamp(base + jitter, 0, 100);
    const assignmentScore =
      assignmentFromFile ??
      (samplePapers !== null ? clamp(50 + samplePapers * 5, 0, 100) : clamp(base + 5 + jitter, 0, 100));
    const quizScore = quizFromFile ?? clamp(base + jitter * 0.8, 0, 100);
    const midtermScore = midtermFromFile ?? clamp(base - 2 + jitter * 0.6, 0, 100);
    const previousCgpa = cgpaFromFile ?? clamp((previousScores ?? base) / 10, 0, 10);

    let studyHours = num("study_hours_per_week");
    if (studyHours === null) {
      studyHours = clamp(8 + base / 10, 0, 50);
    }

    let attendance = num("attendance_percentage");
    if (attendance === null) {
      attendance = clamp(60 + (base - 50) * 0.6 + jitter, 0, 100);
    }

    let semester = num("semester");
    if (semester === null) semester = (index % 8) + 1;
    semester = clamp(Math.round(semester), 1, 8);

    const studentId = mapping.has("student_id")
      ? (row[mapping.get("student_id")!] || `STU${1001 + index}`)
      : `STU${1001 + index}`;
    const studentName = mapping.has("student_name")
      ? (row[mapping.get("student_name")!] || `Student ${index + 1}`)
      : `Student ${index + 1}`;
    const department = mapping.has("department")
      ? (row[mapping.get("department")!] || DEPARTMENTS[index % DEPARTMENTS.length])
      : DEPARTMENTS[index % DEPARTMENTS.length];
    const section = mapping.has("section")
      ? (row[mapping.get("section")!] || SECTIONS[index % SECTIONS.length])
      : SECTIONS[index % SECTIONS.length];

    if (!mapping.has("student_id")) derivedColumns.add("student_id (generated)");
    if (!mapping.has("student_name")) derivedColumns.add("student_name (generated)");
    if (!mapping.has("department")) derivedColumns.add("department (assigned)");
    if (!mapping.has("section")) derivedColumns.add("section (assigned)");
    if (!mapping.has("semester")) derivedColumns.add("semester (assigned)");
    if (num("attendance_percentage") === null) derivedColumns.add("attendance_percentage (estimated)");
    if (studyHours !== null && num("study_hours_per_week") === null) derivedColumns.add("study_hours_per_week (estimated)");
    if (assignmentFromFile === null) derivedColumns.add("assignment_score (derived)");
    if (quizFromFile === null) derivedColumns.add("quiz_score (derived)");
    if (midtermFromFile === null) derivedColumns.add("midterm_score (derived)");
    if (finalFromFile === null) derivedColumns.add("final_score (derived)");
    if (cgpaFromFile === null) derivedColumns.add("previous_cgpa (derived)");

    const record: RawStudentRecord = {
      student_id: String(studentId),
      student_name: String(studentName),
      department: String(department),
      semester: String(semester),
      section: String(section).toUpperCase().slice(0, 1) || "A",
      attendance_percentage: String(round(attendance)),
      study_hours_per_week: String(round(studyHours)),
      assignment_score: String(round(assignmentScore)),
      quiz_score: String(round(quizScore)),
      midterm_score: String(round(midtermScore)),
      final_score: String(round(finalScore)),
      previous_cgpa: String(round(previousCgpa)),
    };
    return record;
  });

  const notes: string[] = [];
  if (mappedColumns.length > 0) {
    notes.push(`Mapped columns: ${mappedColumns.join(", ")}.`);
  }
  if (derivedColumns.size > 0) {
    notes.push(
      `The uploaded file used a different schema, so these fields were generated or estimated from the available data: ${[...derivedColumns].join(", ")}.`,
    );
  }

  return { headers: [...REQUIRED_COLUMNS], rows: adaptedRows, adapted: true, notes };
}
