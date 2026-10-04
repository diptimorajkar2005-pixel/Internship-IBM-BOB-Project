import { count, desc } from "drizzle-orm";
import { db } from "@/db";
import { cleaningReports, students, type NewStudentRow, type StudentRow } from "@/db/schema";
import { applyFilters } from "@/lib/analytics";
import { generateStudentDataset } from "@/lib/generate-dataset";
import type { CleaningReport, DashboardFilters, StudentRecord } from "@/lib/types";

export function rowToRecord(row: StudentRow): StudentRecord {
  return {
    studentId: row.studentId,
    studentName: row.studentName,
    department: row.department,
    semester: row.semester,
    section: row.section,
    attendancePercentage: row.attendancePercentage,
    studyHoursPerWeek: row.studyHoursPerWeek,
    assignmentScore: row.assignmentScore,
    quizScore: row.quizScore,
    midtermScore: row.midtermScore,
    finalScore: row.finalScore,
    previousCgpa: row.previousCgpa,
    overallScore: row.overallScore,
    performanceCategory: row.performanceCategory as StudentRecord["performanceCategory"],
    grade: row.grade as StudentRecord["grade"],
    academicAttention: row.academicAttention as StudentRecord["academicAttention"],
    attentionReason: row.attentionReason,
  };
}

export function recordToInsert(record: StudentRecord): NewStudentRow {
  return {
    studentId: record.studentId,
    studentName: record.studentName,
    department: record.department,
    semester: record.semester,
    section: record.section,
    attendancePercentage: record.attendancePercentage,
    studyHoursPerWeek: record.studyHoursPerWeek,
    assignmentScore: record.assignmentScore,
    quizScore: record.quizScore,
    midtermScore: record.midtermScore,
    finalScore: record.finalScore,
    previousCgpa: record.previousCgpa,
    overallScore: record.overallScore,
    performanceCategory: record.performanceCategory,
    grade: record.grade,
    academicAttention: record.academicAttention,
    attentionReason: record.attentionReason,
  };
}

async function replaceStudents(records: StudentRecord[]) {
  await db.delete(students);
  const chunkSize = 100;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize).map(recordToInsert);
    await db.insert(students).values(chunk);
  }
}

export async function saveCleaningReport(source: string, report: CleaningReport) {
  await db.insert(cleaningReports).values({
    source,
    rowsBefore: report.rowsBefore,
    rowsAfter: report.rowsAfter,
    duplicateRowsRemoved: report.duplicateRowsRemoved,
    missingValuesHandled: report.missingValuesHandled,
    invalidRecordsHandled: report.invalidRecordsHandled,
    extraColumnsIgnored: report.extraColumnsIgnored,
    notes: report.notes.join(" | "),
  });
}

export async function seedDefaultDataset(force = false) {
  const [{ value }] = await db.select({ value: count() }).from(students);
  if (value > 0 && !force) return { seeded: false, count: Number(value) };

  const records = generateStudentDataset(520, 42);
  await replaceStudents(records);
  await saveCleaningReport("default", {
    rowsBefore: records.length,
    rowsAfter: records.length,
    duplicateRowsRemoved: 0,
    missingValuesHandled: 0,
    invalidRecordsHandled: 0,
    extraColumnsIgnored: 0,
    emptyRowsRemoved: 0,
    notes: ["Default synthetic dataset generated with seed 42 and 520 students."],
  });
  return { seeded: true, count: records.length };
}

export async function ensureSeeded() {
  await seedDefaultDataset(false);
}

export async function replaceWithUploaded(records: StudentRecord[], report: CleaningReport) {
  await replaceStudents(records);
  await saveCleaningReport("upload", report);
}

export async function getAllStudents(): Promise<StudentRecord[]> {
  await ensureSeeded();
  const rows = await db.select().from(students);
  return rows.map(rowToRecord);
}

export async function getFilteredStudents(filters: DashboardFilters): Promise<StudentRecord[]> {
  const all = await getAllStudents();
  return applyFilters(all, filters);
}

export async function getLatestCleaningReport() {
  const rows = await db.select().from(cleaningReports).orderBy(desc(cleaningReports.createdAt)).limit(1);
  return rows[0] ?? null;
}

export async function getCleaningHistory() {
  return db.select().from(cleaningReports).orderBy(desc(cleaningReports.createdAt)).limit(8);
}

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): DashboardFilters {
  const read = (key: string) => {
    const value = searchParams[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  return {
    department: read("department"),
    semester: read("semester"),
    section: read("section"),
    performanceCategory: read("category"),
    grade: read("grade"),
    attendanceMin: read("attMin"),
    attendanceMax: read("attMax"),
    studyMin: read("studyMin"),
    studyMax: read("studyMax"),
    search: read("q"),
    selectedStudent: read("student"),
  };
}

export async function getFilterOptions(): Promise<{
  departments: string[];
  semesters: number[];
  sections: string[];
}> {
  const all = await getAllStudents();
  const departments = [...new Set(all.map((row) => row.department))].sort((a, b) => a.localeCompare(b));
  const semesters = [...new Set(all.map((row) => row.semester))].sort((a, b) => a - b);
  const sections = [...new Set(all.map((row) => row.section))].sort((a, b) => a.localeCompare(b));
  return { departments, semesters, sections };
}

export function filterQueryString(filters: DashboardFilters, extra?: Record<string, string>): string {
  const params = new URLSearchParams();
  const source: Record<string, string | undefined> = {
    department: filters.department,
    semester: filters.semester,
    section: filters.section,
    category: filters.performanceCategory,
    grade: filters.grade,
    attMin: filters.attendanceMin,
    attMax: filters.attendanceMax,
    studyMin: filters.studyMin,
    studyMax: filters.studyMax,
    q: filters.search,
    student: filters.selectedStudent,
    ...extra,
  };
  for (const [key, value] of Object.entries(source)) {
    if (value && value !== "all") params.set(key, value);
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}
