"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, RotateCcw, X } from "lucide-react";
import { GRADES, PERFORMANCE_CATEGORIES } from "@/lib/constants";

const FILTER_LABELS: Record<string, string> = {
  department: "Department",
  semester: "Semester",
  section: "Section",
  category: "Category",
  grade: "Grade",
  attMin: "Attendance ≥",
  attMax: "Attendance ≤",
  studyMin: "Study hrs ≥",
  studyMax: "Study hrs ≤",
  q: "Search",
};

type Options = { departments: string[]; semesters: number[]; sections: string[] };

type Props = {
  showSearch?: boolean;
  options?: Options;
};

const EMPTY_OPTIONS: Options = { departments: [], semesters: [], sections: [] };

function FilterBarInner({ showSearch = false, options = EMPTY_OPTIONS }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const departments = options.departments;
  const semesters = options.semesters;
  const sections = options.sections;

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    if (key !== "student") params.delete("student");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    router.refresh();
    const cleared = !value || value === "all";
    showToast(cleared ? `${FILTER_LABELS[key] ?? "Filter"} cleared` : `Filter applied: ${FILTER_LABELS[key] ?? key} = ${value}`);
  }

  function clearOne(key: string) {
    update(key, "all");
  }

  function reset() {
    router.push(pathname);
    router.refresh();
    showToast("All filters reset");
  }

  const selectValue = (key: string) => searchParams.get(key) ?? "all";

  const activeFilters = [...searchParams.entries()].filter(([key]) => key in FILTER_LABELS);

  return (
    <section className="filter-bar">
      <div className="filter-head">
        <div>
          <p className="eyebrow">Filters</p>
          <h2>Refine the current view</h2>
        </div>
        <button type="button" className="ghost-btn" onClick={reset}>
          <RotateCcw size={15} />
          Reset filters
        </button>
      </div>

      {activeFilters.length > 0 ? (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          {activeFilters.map(([key, value]) => (
            <button
              key={`${key}-${value}`}
              type="button"
              className="filter-chip"
              onClick={() => clearOne(key)}
              title="Click to remove this filter"
            >
              {FILTER_LABELS[key] ?? key}: {value}
              <X size={13} />
            </button>
          ))}
        </div>
      ) : (
        <p className="muted small active-filters-empty">No filters applied — showing the full dataset.</p>
      )}

      <div className="filter-grid">
        {showSearch ? (
          <label>
            Search student
            <input
              key={`q-${searchParams.get("q") ?? ""}`}
              defaultValue={searchParams.get("q") ?? ""}
              placeholder="Name or student ID"
              onBlur={(event) => update("q", event.target.value.trim())}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  update("q", (event.target as HTMLInputElement).value.trim());
                }
              }}
            />
          </label>
        ) : null}
        <label>
          Department
          <select value={selectValue("department")} onChange={(event) => update("department", event.target.value)}>
            <option value="all">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>
        <label>
          Semester
          <select value={selectValue("semester")} onChange={(event) => update("semester", event.target.value)}>
            <option value="all">All semesters</option>
            {semesters.map((semester) => (
              <option key={semester} value={String(semester)}>
                Semester {semester}
              </option>
            ))}
          </select>
        </label>
        <label>
          Section
          <select value={selectValue("section")} onChange={(event) => update("section", event.target.value)}>
            <option value="all">All sections</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </select>
        </label>
        <label>
          Performance category
          <select value={selectValue("category")} onChange={(event) => update("category", event.target.value)}>
            <option value="all">All categories</option>
            {PERFORMANCE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Grade
          <select value={selectValue("grade")} onChange={(event) => update("grade", event.target.value)}>
            <option value="all">All grades</option>
            {GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </label>
        <label>
          Attendance min %
          <input
            key={`attMin-${searchParams.get("attMin") ?? ""}`}
            type="number"
            min={0}
            max={100}
            defaultValue={searchParams.get("attMin") ?? ""}
            placeholder="0"
            onBlur={(event) => update("attMin", event.target.value)}
          />
        </label>
        <label>
          Attendance max %
          <input
            key={`attMax-${searchParams.get("attMax") ?? ""}`}
            type="number"
            min={0}
            max={100}
            defaultValue={searchParams.get("attMax") ?? ""}
            placeholder="100"
            onBlur={(event) => update("attMax", event.target.value)}
          />
        </label>
        <label>
          Study hours min
          <input
            key={`studyMin-${searchParams.get("studyMin") ?? ""}`}
            type="number"
            min={0}
            max={50}
            defaultValue={searchParams.get("studyMin") ?? ""}
            placeholder="0"
            onBlur={(event) => update("studyMin", event.target.value)}
          />
        </label>
        <label>
          Study hours max
          <input
            key={`studyMax-${searchParams.get("studyMax") ?? ""}`}
            type="number"
            min={0}
            max={50}
            defaultValue={searchParams.get("studyMax") ?? ""}
            placeholder="50"
            onBlur={(event) => update("studyMax", event.target.value)}
          />
        </label>
      </div>

      {toast ? (
        <div className="filter-toast" role="status" aria-live="polite">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      ) : null}
    </section>
  );
}

export function FilterBar(props: Props) {
  return (
    <Suspense fallback={<section className="filter-bar">Loading filters…</section>}>
      <FilterBarInner {...props} />
    </Suspense>
  );
}
