import type { Grade, PerformanceCategory, StudentRecord } from "@/lib/types";
import { OVERALL_SCORE_WEIGHTS } from "@/lib/constants";

export function roundTo(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function calculateOverallScore(input: {
  assignmentScore: number;
  quizScore: number;
  midtermScore: number;
  finalScore: number;
}): number {
  const score =
    input.assignmentScore * OVERALL_SCORE_WEIGHTS.assignment +
    input.quizScore * OVERALL_SCORE_WEIGHTS.quiz +
    input.midtermScore * OVERALL_SCORE_WEIGHTS.midterm +
    input.finalScore * OVERALL_SCORE_WEIGHTS.final;
  return roundTo(score, 2);
}

export function getPerformanceCategory(overallScore: number): PerformanceCategory {
  if (overallScore >= 90) return "Excellent";
  if (overallScore >= 75) return "Good";
  if (overallScore >= 60) return "Average";
  return "Needs Improvement";
}

export function getGrade(overallScore: number): Grade {
  if (overallScore >= 90) return "A+";
  if (overallScore >= 80) return "A";
  if (overallScore >= 70) return "B";
  if (overallScore >= 60) return "C";
  if (overallScore >= 50) return "D";
  return "F";
}

export function getAcademicAttention(input: {
  overallScore: number;
  attendancePercentage: number;
  finalScore: number;
}): { academicAttention: "Yes" | "No"; attentionReason: string } {
  const reasons: string[] = [];
  if (input.overallScore < 60) reasons.push("Low overall performance");
  if (input.attendancePercentage < 75) reasons.push("Low attendance");
  if (input.finalScore < 50) reasons.push("Low final examination score");

  if (reasons.length === 0) {
    return { academicAttention: "No", attentionReason: "None" };
  }

  return {
    academicAttention: "Yes",
    attentionReason: reasons.join("; "),
  };
}

export function enrichStudent(
  input: Omit<
    StudentRecord,
    "overallScore" | "performanceCategory" | "grade" | "academicAttention" | "attentionReason"
  >,
): StudentRecord {
  const overallScore = calculateOverallScore(input);
  const performanceCategory = getPerformanceCategory(overallScore);
  const grade = getGrade(overallScore);
  const attention = getAcademicAttention({
    overallScore,
    attendancePercentage: input.attendancePercentage,
    finalScore: input.finalScore,
  });

  return {
    ...input,
    overallScore,
    performanceCategory,
    grade,
    academicAttention: attention.academicAttention,
    attentionReason: attention.attentionReason,
  };
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return roundTo(values.reduce((sum, value) => sum + value, 0) / values.length, 2);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return roundTo((sorted[mid - 1] + sorted[mid]) / 2, 2);
  }
  return roundTo(sorted[mid], 2);
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const n = x.length;
  const meanX = x.reduce((sum, value) => sum + value, 0) / n;
  const meanY = y.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  const denom = Math.sqrt(denomX * denomY);
  if (denom === 0) return 0;
  return roundTo(numerator / denom, 3);
}
