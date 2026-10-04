"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import type { AssessmentAverages, CorrelationMatrix, GroupStat, StudentRecord } from "@/lib/types";

type DistPoint = { label: string; count: number };

function ChartFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="chart-card">
      <h3>{title}</h3>
      <div className="chart-body">{children}</div>
    </article>
  );
}

export function PerformanceDistributionChart({ data }: { data: DistPoint[] }) {
  return (
    <ChartFrame title="Overall performance distribution">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" name="Students" fill="#1e4d6b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function DepartmentPerformanceChart({ data }: { data: GroupStat[] }) {
  return (
    <ChartFrame title="Department-wise average performance">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="averageOverallScore" name="Average score" fill="#0f766e" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function SemesterPerformanceChart({ data }: { data: GroupStat[] }) {
  return (
    <ChartFrame title="Semester-wise average performance">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="averageOverallScore" name="Average score" stroke="#c45c26" strokeWidth={2.5} dot />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function AttendanceDistributionChart({ data }: { data: GroupStat[] }) {
  return (
    <ChartFrame title="Attendance distribution">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="studentCount" name="Students" fill="#5b4b8a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function StudyHoursDistributionChart({ data }: { data: GroupStat[] }) {
  return (
    <ChartFrame title="Study-hours distribution">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="studentCount" name="Students" fill="#2f6f4e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function AttendanceScatterChart({ records }: { records: StudentRecord[] }) {
  const data = records.map((row) => ({
    attendance: row.attendancePercentage,
    score: row.overallScore,
    name: row.studentName,
  }));
  return (
    <ChartFrame title="Attendance vs overall performance">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis type="number" dataKey="attendance" name="Attendance %" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <YAxis type="number" dataKey="score" name="Overall score" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="Students" data={data} fill="#1e4d6b" fillOpacity={0.55} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function StudyScatterChart({ records }: { records: StudentRecord[] }) {
  const data = records.map((row) => ({
    hours: row.studyHoursPerWeek,
    score: row.overallScore,
    name: row.studentName,
  }));
  return (
    <ChartFrame title="Study hours vs overall performance">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis type="number" dataKey="hours" name="Study hours / week" domain={[0, 50]} tick={{ fontSize: 11 }} />
          <YAxis type="number" dataKey="score" name="Overall score" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="Students" data={data} fill="#c9a227" fillOpacity={0.65} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function CategoryPieChart({ data }: { data: GroupStat[] }) {
  const pieData = data.map((row) => ({ name: row.label, value: row.studentCount }));
  return (
    <ChartFrame title="Performance category distribution">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
            {pieData.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function AssessmentComparisonChart({ data }: { data: AssessmentAverages }) {
  const rows = [
    { label: "Assignment", score: data.assignment },
    { label: "Quiz", score: data.quiz },
    { label: "Midterm", score: data.midterm },
    { label: "Final", score: data.final },
  ];
  return (
    <ChartFrame title="Assessment score comparison">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="score" name="Average score" radius={[6, 6, 0, 0]}>
            {rows.map((row, index) => (
              <Cell key={row.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function DepartmentAttendanceChart({ data }: { data: GroupStat[] }) {
  return (
    <ChartFrame title="Department-wise attendance">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={70} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="averageAttendance" name="Average attendance %" fill="#3d6ea8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function SemesterCgpaChart({ data }: { data: GroupStat[] }) {
  return (
    <ChartFrame title="Semester-wise CGPA">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="averageCgpa" name="Average CGPA" stroke="#8a3d4a" strokeWidth={2.5} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function CorrelationHeatmap({ matrix }: { matrix: CorrelationMatrix }) {
  return (
    <ChartFrame title="Correlation heatmap">
      <div className="heatmap" role="img" aria-label="Correlation heatmap">
        <div className="heatmap-corner" />
        {matrix.labels.map((label) => (
          <div key={`col-${label}`} className="heatmap-col-label">
            {label}
          </div>
        ))}
        {matrix.values.map((row, rowIndex) => (
          <div key={matrix.labels[rowIndex]} className="heatmap-row">
            <div className="heatmap-row-label">{matrix.labels[rowIndex]}</div>
            {row.map((value, colIndex) => {
              const intensity = Math.abs(value);
              const background =
                value >= 0
                  ? `rgba(15, 118, 110, ${0.12 + intensity * 0.75})`
                  : `rgba(196, 92, 38, ${0.12 + intensity * 0.75})`;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="heatmap-cell"
                  style={{ background }}
                  title={`${matrix.labels[rowIndex]} vs ${matrix.labels[colIndex]}: ${value}`}
                >
                  {value.toFixed(2)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="muted small">
        Correlation measures association, not causation. A high value does not mean one factor causes another.
      </p>
    </ChartFrame>
  );
}

export function StudyGroupPerformanceChart({ data }: { data: GroupStat[] }) {
  return (
    <ChartFrame title="Average performance by study-hour group">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="averageOverallScore" name="Average score" fill="#0f766e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
