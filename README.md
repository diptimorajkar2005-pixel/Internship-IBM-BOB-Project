# Student Performance Analytics Dashboard

**Interactive Academic Performance & Student Insights Platform**

A complete college-level academic analytics application. Teachers and academic coordinators can load student CSV data, clean it, calculate performance metrics, explore interactive charts, and download reports.

This implementation runs as a Next.js App Router web application with PostgreSQL so the dashboard can be used in a browser without a separate Streamlit process. The analytics pipeline is the same:

```text
CSV
 ↓
Validation
 ↓
Data Cleaning
 ↓
Analytics
 ↓
Visualization
 ↓
Interactive Dashboard
 ↓
Insights
 ↓
Downloads
```

## Problem Statement

Student academic records are often stored as spreadsheets. Manually scanning hundreds of rows makes it hard to see department trends, attendance risk, study-hour patterns, or students who need support. Errors in the file (missing values, duplicate IDs, out-of-range scores) are easy to miss.

## Objective

Convert raw student academic data into a trustworthy, filterable dashboard that:

- Measures overall academic performance
- Shows attendance, study-hour, assignment, quiz, midterm, and final patterns
- Compares departments, semesters, and sections
- Flags students requiring academic attention with documented reasons
- Produces downloadable CSV reports from the current filtered view

## Features

- Default synthetic dataset of 520 students (reproducible with seed 42)
- CSV upload with column validation and friendly error messages
- Data cleaning report (duplicates, missing values, invalid ranges)
- Overall score, grade, and performance category calculations
- Department, semester, section, attendance, and study-hour analysis
- Correlation heatmap with a clear non-causation warning
- Student search and individual profile view
- Academic attention list with sort options
- Dynamic descriptive insights
- CSV downloads for filtered data, attention list, summary stats, department analysis, and semester analysis
- Sidebar filters that apply across every page

## Technology Stack

- **Next.js (App Router)** — pages, server rendering, and API routes
- **React** — interactive filters, charts, and upload form
- **PostgreSQL + Drizzle ORM** — persistent student records and cleaning reports
- **Recharts** — dashboard visualizations
- **TypeScript** — typed analytics and validation modules
- **Tailwind CSS** — layout utilities, plus custom academic styling

## Dataset

Required CSV columns:

| Column | Meaning |
| --- | --- |
| student_id | Unique ID such as STU1001 |
| student_name | Full name |
| department | Programme name |
| semester | 1–8 |
| section | A, B, C, or D |
| attendance_percentage | 0–100 |
| study_hours_per_week | 0–50 |
| assignment_score | 0–100 |
| quiz_score | 0–100 |
| midterm_score | 0–100 |
| final_score | 0–100 |
| previous_cgpa | 0–10 |

The generator creates realistic but imperfect relationships: higher study hours and attendance generally go with higher scores, and previous CGPA has some association with current performance. Exceptions are included on purpose.

## Analytics

**Overall score**

```text
overall_score =
    assignment_score × 0.15
  + quiz_score × 0.15
  + midterm_score × 0.30
  + final_score × 0.40
```

**Performance categories**

- 90–100: Excellent
- 75–89.99: Good
- 60–74.99: Average
- Below 60: Needs Improvement

**Grades**

- 90+: A+
- 80–89: A
- 70–79: B
- 60–69: C
- 50–59: D
- Below 50: F

**Academic attention**

A student is flagged **Requires Academic Attention** when:

- overall_score < 60, or
- attendance_percentage < 75, or
- final_score < 50

Reasons are combined with semicolons, for example `Low attendance; Low overall performance`.

## Project Structure

```text
src/
  app/                 Dashboard pages and API routes
  components/          Sidebar, filters, charts, tables
  db/                  Drizzle client and schema
  lib/
    generate-dataset.ts
    validators.ts
    data-cleaning.ts
    analytics.ts
    insights.ts
    formulas.ts
    csv.ts
    self-check.ts
```

## Installation

```powershell
npm install
npx drizzle-kit push
npm run dev
```

Open the local URL printed by Next.js (typically `http://localhost:3000`).

The first page load seeds 520 students if the table is empty. Use **Restore default dataset** any time to regenerate seed 42.

## Testing

Open **Data Quality** to run the built-in analytics checks (overall score, grades, categories, attention rules, validation, cleaning, filters, and dataset uniqueness).

The same checks live in `src/lib/self-check.ts` (20+ assertions).

## Future Scope

Possible later improvements, not included in this version:

- Predictive models for at-risk students
- Role-based login for faculty
- Export to PDF report cards
- Multi-year longitudinal comparison
