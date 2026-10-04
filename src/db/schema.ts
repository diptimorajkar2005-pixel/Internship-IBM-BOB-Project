import { integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  studentName: text("student_name").notNull(),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  section: text("section").notNull(),
  attendancePercentage: real("attendance_percentage").notNull(),
  studyHoursPerWeek: real("study_hours_per_week").notNull(),
  assignmentScore: real("assignment_score").notNull(),
  quizScore: real("quiz_score").notNull(),
  midtermScore: real("midterm_score").notNull(),
  finalScore: real("final_score").notNull(),
  previousCgpa: real("previous_cgpa").notNull(),
  overallScore: real("overall_score").notNull(),
  performanceCategory: text("performance_category").notNull(),
  grade: text("grade").notNull(),
  academicAttention: text("academic_attention").notNull(),
  attentionReason: text("attention_reason").notNull(),
});

export const cleaningReports = pgTable("cleaning_reports", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  rowsBefore: integer("rows_before").notNull(),
  rowsAfter: integer("rows_after").notNull(),
  duplicateRowsRemoved: integer("duplicate_rows_removed").notNull(),
  missingValuesHandled: integer("missing_values_handled").notNull(),
  invalidRecordsHandled: integer("invalid_records_handled").notNull(),
  extraColumnsIgnored: integer("extra_columns_ignored").notNull(),
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type StudentRow = typeof students.$inferSelect;
export type NewStudentRow = typeof students.$inferInsert;
export type CleaningReportRow = typeof cleaningReports.$inferSelect;
