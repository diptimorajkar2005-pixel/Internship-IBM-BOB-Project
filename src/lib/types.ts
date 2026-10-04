export const REQUIRED_COLUMNS = [
  "student_id",
  "student_name",
  "department",
  "semester",
  "section",
  "attendance_percentage",
  "study_hours_per_week",
  "assignment_score",
  "quiz_score",
  "midterm_score",
  "final_score",
  "previous_cgpa",
] as const;

export type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];

export type RawStudentRecord = Record<string, string>;

export type StudentRecord = {
  studentId: string;
  studentName: string;
  department: string;
  semester: number;
  section: string;
  attendancePercentage: number;
  studyHoursPerWeek: number;
  assignmentScore: number;
  quizScore: number;
  midtermScore: number;
  finalScore: number;
  previousCgpa: number;
  overallScore: number;
  performanceCategory: PerformanceCategory;
  grade: Grade;
  academicAttention: "Yes" | "No";
  attentionReason: string;
};

export type PerformanceCategory = "Excellent" | "Good" | "Average" | "Needs Improvement";
export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

export type ValidationIssue = {
  level: "error" | "warning";
  message: string;
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
  extraColumns: string[];
};

export type CleaningReport = {
  rowsBefore: number;
  rowsAfter: number;
  duplicateRowsRemoved: number;
  missingValuesHandled: number;
  invalidRecordsHandled: number;
  extraColumnsIgnored: number;
  emptyRowsRemoved: number;
  notes: string[];
};

export type DashboardFilters = {
  department?: string;
  semester?: string;
  section?: string;
  performanceCategory?: string;
  grade?: string;
  attendanceMin?: string;
  attendanceMax?: string;
  studyMin?: string;
  studyMax?: string;
  search?: string;
  selectedStudent?: string;
};

export type OverallStatistics = {
  totalStudents: number;
  averageOverallScore: number;
  medianOverallScore: number;
  highestOverallScore: number;
  lowestOverallScore: number;
  averageAttendance: number;
  averageStudyHours: number;
  averageCgpa: number;
  averageAssignmentScore: number;
  averageQuizScore: number;
  averageMidtermScore: number;
  averageFinalScore: number;
  attentionCount: number;
  attentionPercentage: number;
};

export type GroupStat = {
  label: string;
  studentCount: number;
  averageOverallScore: number;
  averageAttendance: number;
  averageCgpa: number;
  averageStudyHours: number;
};

export type SectionStat = GroupStat & {
  department?: string;
};

export type AssessmentAverages = {
  assignment: number;
  quiz: number;
  midterm: number;
  final: number;
};

export type CorrelationMatrix = {
  labels: string[];
  values: number[][];
};

export type DashboardInsights = {
  overall: string[];
  attendance: string[];
  study: string[];
  department: string[];
  academicAttention: string[];
};
