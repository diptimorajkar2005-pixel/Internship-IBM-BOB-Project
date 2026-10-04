import {
  ATTENDANCE_BINS,
  CORRELATION_FIELDS,
  STUDY_HOUR_BINS,
} from "@/lib/constants";
import { mean, median, pearsonCorrelation, roundTo } from "@/lib/formulas";
import type {
  AssessmentAverages,
  CorrelationMatrix,
  GroupStat,
  OverallStatistics,
  SectionStat,
  StudentRecord,
} from "@/lib/types";

function groupBy(records: StudentRecord[], keyFn: (record: StudentRecord) => string): Map<string, StudentRecord[]> {
  const groups = new Map<string, StudentRecord[]>();
  for (const record of records) {
    const key = keyFn(record);
    const list = groups.get(key);
    if (list) list.push(record);
    else groups.set(key, [record]);
  }
  return groups;
}

function toGroupStat(label: string, records: StudentRecord[]): GroupStat {
  return {
    label,
    studentCount: records.length,
    averageOverallScore: mean(records.map((row) => row.overallScore)),
    averageAttendance: mean(records.map((row) => row.attendancePercentage)),
    averageCgpa: mean(records.map((row) => row.previousCgpa)),
    averageStudyHours: mean(records.map((row) => row.studyHoursPerWeek)),
  };
}

export function getOverallStatistics(records: StudentRecord[]): OverallStatistics {
  const scores = records.map((row) => row.overallScore);
  const attentionCount = records.filter((row) => row.academicAttention === "Yes").length;
  return {
    totalStudents: records.length,
    averageOverallScore: mean(scores),
    medianOverallScore: median(scores),
    highestOverallScore: scores.length ? roundTo(Math.max(...scores)) : 0,
    lowestOverallScore: scores.length ? roundTo(Math.min(...scores)) : 0,
    averageAttendance: mean(records.map((row) => row.attendancePercentage)),
    averageStudyHours: mean(records.map((row) => row.studyHoursPerWeek)),
    averageCgpa: mean(records.map((row) => row.previousCgpa)),
    averageAssignmentScore: mean(records.map((row) => row.assignmentScore)),
    averageQuizScore: mean(records.map((row) => row.quizScore)),
    averageMidtermScore: mean(records.map((row) => row.midtermScore)),
    averageFinalScore: mean(records.map((row) => row.finalScore)),
    attentionCount,
    attentionPercentage: records.length ? roundTo((attentionCount / records.length) * 100) : 0,
  };
}

export function getDepartmentAnalysis(records: StudentRecord[]): GroupStat[] {
  const groups = groupBy(records, (row) => row.department);
  return [...groups.entries()]
    .map(([label, rows]) => toGroupStat(label, rows))
    .sort((a, b) => b.averageOverallScore - a.averageOverallScore);
}

export function getSemesterAnalysis(records: StudentRecord[]): GroupStat[] {
  const groups = groupBy(records, (row) => String(row.semester));
  return [...groups.entries()]
    .map(([label, rows]) => toGroupStat(`Semester ${label}`, rows))
    .sort((a, b) => Number(a.label.replace("Semester ", "")) - Number(b.label.replace("Semester ", "")));
}

export function getSectionAnalysis(records: StudentRecord[]): GroupStat[] {
  const groups = groupBy(records, (row) => row.section);
  return [...groups.entries()]
    .map(([label, rows]) => toGroupStat(`Section ${label}`, rows))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getDepartmentSectionAnalysis(records: StudentRecord[]): SectionStat[] {
  const groups = groupBy(records, (row) => `${row.department}||${row.section}`);
  return [...groups.entries()]
    .map(([key, rows]) => {
      const [department, section] = key.split("||");
      return { ...toGroupStat(`${department} — Section ${section}`, rows), department };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getAttendanceAnalysis(records: StudentRecord[]): GroupStat[] {
  return ATTENDANCE_BINS.map((bin) => {
    const rows = records.filter(
      (row) => row.attendancePercentage >= bin.min && row.attendancePercentage <= bin.max,
    );
    return toGroupStat(bin.label, rows);
  });
}

export function getStudyHourAnalysis(records: StudentRecord[]): GroupStat[] {
  return STUDY_HOUR_BINS.map((bin) => {
    const rows = records.filter((row) => {
      if (bin.label === "41+") return row.studyHoursPerWeek >= bin.min;
      return row.studyHoursPerWeek >= bin.min && row.studyHoursPerWeek <= bin.max;
    });
    return toGroupStat(bin.label, rows);
  });
}

export function getAssessmentAverages(records: StudentRecord[]): AssessmentAverages {
  return {
    assignment: mean(records.map((row) => row.assignmentScore)),
    quiz: mean(records.map((row) => row.quizScore)),
    midterm: mean(records.map((row) => row.midtermScore)),
    final: mean(records.map((row) => row.finalScore)),
  };
}

export function getPerformanceCategoryDistribution(records: StudentRecord[]): GroupStat[] {
  const order = ["Excellent", "Good", "Average", "Needs Improvement"];
  const groups = groupBy(records, (row) => row.performanceCategory);
  return order.map((label) => toGroupStat(label, groups.get(label) ?? []));
}

export function getGradeDistribution(records: StudentRecord[]): GroupStat[] {
  const order = ["A+", "A", "B", "C", "D", "F"];
  const groups = groupBy(records, (row) => row.grade);
  return order.map((label) => toGroupStat(label, groups.get(label) ?? []));
}

export function getScoreDistribution(records: StudentRecord[], binSize = 10): { label: string; count: number }[] {
  const bins: { label: string; count: number }[] = [];
  for (let start = 0; start < 100; start += binSize) {
    const end = start + binSize;
    const count = records.filter((row) => {
      if (end >= 100) return row.overallScore >= start && row.overallScore <= 100;
      return row.overallScore >= start && row.overallScore < end;
    }).length;
    bins.push({ label: `${start}–${end}`, count });
  }
  return bins;
}

export function getCorrelationMatrix(records: StudentRecord[]): CorrelationMatrix {
  const labels = CORRELATION_FIELDS.map((field) => field.label);
  const series = CORRELATION_FIELDS.map((field) => records.map((row) => row[field.key] as number));
  const values = series.map((x) => series.map((y) => pearsonCorrelation(x, y)));
  return { labels, values };
}

export function getStudentsRequiringAttention(records: StudentRecord[]): StudentRecord[] {
  return records
    .filter((row) => row.academicAttention === "Yes")
    .sort((a, b) => a.overallScore - b.overallScore);
}

export function applyFilters(records: StudentRecord[], filters: {
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
}): StudentRecord[] {
  const attendanceMin = filters.attendanceMin ? Number(filters.attendanceMin) : 0;
  const attendanceMax = filters.attendanceMax ? Number(filters.attendanceMax) : 100;
  const studyMin = filters.studyMin ? Number(filters.studyMin) : 0;
  const studyMax = filters.studyMax ? Number(filters.studyMax) : 50;
  const query = filters.search?.trim().toLowerCase() ?? "";

  return records.filter((row) => {
    if (filters.department && filters.department !== "all" && row.department !== filters.department) return false;
    if (filters.semester && filters.semester !== "all" && String(row.semester) !== filters.semester) return false;
    if (filters.section && filters.section !== "all" && row.section !== filters.section) return false;
    if (
      filters.performanceCategory &&
      filters.performanceCategory !== "all" &&
      row.performanceCategory !== filters.performanceCategory
    ) {
      return false;
    }
    if (filters.grade && filters.grade !== "all" && row.grade !== filters.grade) return false;
    if (row.attendancePercentage < attendanceMin || row.attendancePercentage > attendanceMax) return false;
    if (row.studyHoursPerWeek < studyMin || row.studyHoursPerWeek > studyMax) return false;
    if (query) {
      const haystack = `${row.studentId} ${row.studentName}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
