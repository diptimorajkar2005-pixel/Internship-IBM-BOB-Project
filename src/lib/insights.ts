import { getAttendanceAnalysis, getDepartmentAnalysis, getOverallStatistics, getStudyHourAnalysis } from "@/lib/analytics";
import type { DashboardInsights, StudentRecord } from "@/lib/types";

export function generateInsights(records: StudentRecord[]): DashboardInsights {
  if (records.length === 0) {
    const empty = ["No students match the current filters, so insights cannot be generated."];
    return {
      overall: empty,
      attendance: empty,
      study: empty,
      department: empty,
      academicAttention: empty,
    };
  }

  const stats = getOverallStatistics(records);
  const departments = getDepartmentAnalysis(records);
  const attendance = getAttendanceAnalysis(records);
  const study = getStudyHourAnalysis(records);

  const topDepartment = departments[0];
  const lowestDepartment = [...departments].sort((a, b) => a.averageOverallScore - b.averageOverallScore)[0];
  const lowestAttendanceGroup = [...attendance]
    .filter((row) => row.studentCount > 0)
    .sort((a, b) => a.averageAttendance - b.averageAttendance)[0];
  const highestAttendanceGroup = [...attendance]
    .filter((row) => row.studentCount > 0)
    .sort((a, b) => b.averageOverallScore - a.averageOverallScore)[0];
  const lowestStudyGroup = [...study].filter((row) => row.studentCount > 0).sort((a, b) => a.averageOverallScore - b.averageOverallScore)[0];
  const highestStudyGroup = [...study].filter((row) => row.studentCount > 0).sort((a, b) => b.averageOverallScore - a.averageOverallScore)[0];

  const below75 = records.filter((row) => row.attendancePercentage < 75).length;
  const excellentCount = records.filter((row) => row.performanceCategory === "Excellent").length;
  const needsImprovement = records.filter((row) => row.performanceCategory === "Needs Improvement").length;

  return {
    overall: [
      `The current view includes ${stats.totalStudents} student${stats.totalStudents === 1 ? "" : "s"}.`,
      `The average overall score is ${stats.averageOverallScore}, with a median of ${stats.medianOverallScore}.`,
      `Overall scores in this view range from ${stats.lowestOverallScore} to ${stats.highestOverallScore}.`,
      `${excellentCount} student(s) are in the Excellent category and ${needsImprovement} are in Needs Improvement.`,
      `Average assessment scores are Assignment ${stats.averageAssignmentScore}, Quiz ${stats.averageQuizScore}, Midterm ${stats.averageMidtermScore}, and Final ${stats.averageFinalScore}.`,
    ],
    attendance: [
      `Average attendance in this dataset is ${stats.averageAttendance}%.`,
      `${below75} student(s) currently have attendance below 75%.`,
      lowestAttendanceGroup
        ? `The attendance group with the lowest average attendance is ${lowestAttendanceGroup.label} (${lowestAttendanceGroup.averageAttendance}%).`
        : "Attendance groups could not be compared.",
      highestAttendanceGroup
        ? `Students in the ${highestAttendanceGroup.label} attendance group have an average overall score of ${highestAttendanceGroup.averageOverallScore} in this dataset.`
        : "Attendance and performance could not be compared.",
      "These figures describe the current filtered data. They do not prove that attendance causes higher scores.",
    ],
    study: [
      `Students in this view study ${stats.averageStudyHours} hours per week on average.`,
      highestStudyGroup
        ? `The ${highestStudyGroup.label} hours/week group has the highest average overall score (${highestStudyGroup.averageOverallScore}).`
        : "Study-hour groups could not be compared.",
      lowestStudyGroup
        ? `The ${lowestStudyGroup.label} hours/week group has the lowest average overall score (${lowestStudyGroup.averageOverallScore}).`
        : "Study-hour groups could not be compared.",
      "Students with higher study hours in this dataset tend to have a higher average performance, with realistic exceptions still present.",
      "This is an observed association in the current data, not a causal claim.",
    ],
    department: [
      topDepartment
        ? `${topDepartment.label} has the highest average overall score (${topDepartment.averageOverallScore}) among ${topDepartment.studentCount} students.`
        : "Department comparison is unavailable.",
      lowestDepartment
        ? `${lowestDepartment.label} has the lowest average overall score (${lowestDepartment.averageOverallScore}).`
        : "Department comparison is unavailable.",
      topDepartment
        ? `${topDepartment.label} also shows average attendance of ${topDepartment.averageAttendance}% and average previous CGPA of ${topDepartment.averageCgpa}.`
        : "Department attendance is unavailable.",
      `Department comparisons use the currently filtered records only.`,
    ],
    academicAttention: [
      `${stats.attentionCount} student(s) (${stats.attentionPercentage}%) currently require academic attention.`,
      "A student is flagged when overall score is below 60, attendance is below 75%, or final examination score is below 50.",
      stats.attentionCount > 0
        ? "The Academic Attention page lists each flagged student with a clear, non-punitive reason."
        : "No students in the current filter meet the academic-attention criteria.",
      "These flags are intended to help teachers offer support, not to label students negatively.",
    ],
  };
}
