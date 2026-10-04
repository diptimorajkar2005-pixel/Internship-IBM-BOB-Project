import { BookOpen, Clock3, GraduationCap, Target, Users } from "lucide-react";
import type { OverallStatistics } from "@/lib/types";

export function KpiCards({ stats }: { stats: OverallStatistics }) {
  const items = [
    { label: "Total Students", value: stats.totalStudents.toLocaleString(), icon: Users, tone: "navy" },
    { label: "Average Performance", value: stats.averageOverallScore.toFixed(2), icon: Target, tone: "teal" },
    { label: "Average Attendance", value: `${stats.averageAttendance.toFixed(2)}%`, icon: Clock3, tone: "gold" },
    { label: "Average Study Hours", value: stats.averageStudyHours.toFixed(2), icon: BookOpen, tone: "green" },
    { label: "Average CGPA", value: stats.averageCgpa.toFixed(2), icon: GraduationCap, tone: "wine" },
  ];

  return (
    <section className="kpi-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.label} className={`kpi-card tone-${item.tone}`}>
            <div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </div>
            <span>
              <Icon size={18} />
            </span>
          </article>
        );
      })}
    </section>
  );
}
