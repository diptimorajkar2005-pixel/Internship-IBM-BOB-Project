import { CSV_HEADERS } from "@/lib/constants";
import type { RawStudentRecord, StudentRecord } from "@/lib/types";

function escapeCsvField(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function parseCsv(content: string): { headers: string[]; rows: RawStudentRecord[] } {
  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    if (char === '"') {
      current += char;
      if (inQuotes && normalized[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "\n" && !inQuotes) {
      lines.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.length > 0) lines.push(current);

  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  if (nonEmpty.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = splitCsvLine(nonEmpty[0]).map((header) => header.trim());
  const rows: RawStudentRecord[] = [];

  for (let i = 1; i < nonEmpty.length; i += 1) {
    const values = splitCsvLine(nonEmpty[i]);
    const row: RawStudentRecord = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] ?? "").trim();
    });
    rows.push(row);
  }

  return { headers, rows };
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

export function recordsToCsv(records: StudentRecord[]): string {
  const extraHeaders = [
    "overall_score",
    "performance_category",
    "grade",
    "academic_attention",
    "attention_reason",
  ];
  const headers = [...CSV_HEADERS, ...extraHeaders];
  const lines = [headers.join(",")];

  for (const record of records) {
    const values = [
      record.studentId,
      record.studentName,
      record.department,
      record.semester,
      record.section,
      record.attendancePercentage,
      record.studyHoursPerWeek,
      record.assignmentScore,
      record.quizScore,
      record.midtermScore,
      record.finalScore,
      record.previousCgpa,
      record.overallScore,
      record.performanceCategory,
      record.grade,
      record.academicAttention,
      record.attentionReason,
    ];
    lines.push(values.map(escapeCsvField).join(","));
  }

  return `${lines.join("\n")}\n`;
}

export function objectsToCsv(rows: Array<Record<string, string | number>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvField(row[header] ?? "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}
