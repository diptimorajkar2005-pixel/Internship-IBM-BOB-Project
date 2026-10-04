export const APP_TITLE = "Student Performance Analytics Dashboard";
export const APP_SUBTITLE = "Interactive Academic Performance & Student Insights Platform";

export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Artificial Intelligence & ML",
  "Electronics",
  "Mechanical",
] as const;

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const SECTIONS = ["A", "B", "C", "D"] as const;

export const PERFORMANCE_CATEGORIES = [
  "Excellent",
  "Good",
  "Average",
  "Needs Improvement",
] as const;

export const GRADES = ["A+", "A", "B", "C", "D", "F"] as const;

export const ATTENDANCE_BINS = [
  { label: "Below 60%", min: 0, max: 59.999 },
  { label: "60–74%", min: 60, max: 74.999 },
  { label: "75–84%", min: 75, max: 84.999 },
  { label: "85–94%", min: 85, max: 94.999 },
  { label: "95–100%", min: 95, max: 100 },
] as const;

export const STUDY_HOUR_BINS = [
  { label: "0–5", min: 0, max: 5 },
  { label: "6–10", min: 6, max: 10 },
  { label: "11–20", min: 11, max: 20 },
  { label: "21–30", min: 21, max: 30 },
  { label: "31–40", min: 31, max: 40 },
  { label: "41+", min: 41, max: 50 },
] as const;

export const OVERALL_SCORE_WEIGHTS = {
  assignment: 0.15,
  quiz: 0.15,
  midterm: 0.3,
  final: 0.4,
} as const;

export const CORRELATION_FIELDS = [
  { key: "attendancePercentage", label: "Attendance" },
  { key: "studyHoursPerWeek", label: "Study Hours" },
  { key: "assignmentScore", label: "Assignment" },
  { key: "quizScore", label: "Quiz" },
  { key: "midtermScore", label: "Midterm" },
  { key: "finalScore", label: "Final" },
  { key: "overallScore", label: "Overall" },
  { key: "previousCgpa", label: "Previous CGPA" },
] as const;

export const CSV_HEADERS = [
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

export const IMAGES = {
  campus:
    "https://images.pexels.com/photos/26600253/pexels-photo-26600253.jpeg?auto=compress&cs=tinysrgb&w=1600",
  library:
    "https://images.pexels.com/photos/8199762/pexels-photo-8199762.jpeg?auto=compress&cs=tinysrgb&w=1600",
  lecture:
    "https://images.pexels.com/photos/8197553/pexels-photo-8197553.jpeg?auto=compress&cs=tinysrgb&w=1600",
  studyGroup:
    "https://images.pexels.com/photos/8199558/pexels-photo-8199558.jpeg?auto=compress&cs=tinysrgb&w=1600",
  courtyard:
    "https://images.pexels.com/photos/2982449/pexels-photo-2982449.jpeg?auto=compress&cs=tinysrgb&w=1600",
  gothic:
    "https://images.pexels.com/photos/19554832/pexels-photo-19554832.jpeg?auto=compress&cs=tinysrgb&w=1600",
} as const;

export const CHART_COLORS = [
  "#1e4d6b",
  "#0f766e",
  "#c9a227",
  "#c45c26",
  "#5b4b8a",
  "#2f6f4e",
  "#8a3d4a",
  "#3d6ea8",
];
