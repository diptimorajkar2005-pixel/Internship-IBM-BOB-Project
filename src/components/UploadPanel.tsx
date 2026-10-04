"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Upload, RefreshCw, FileDown } from "lucide-react";

export function UploadPanel() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"success" | "error" | "info">("info");
  const [busy, setBusy] = useState(false);

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("csv") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setTone("error");
      setMessage("Please choose a CSV file before uploading.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const payload = (await response.json()) as { ok: boolean; message: string };
      setTone(response.ok ? "success" : "error");
      setMessage(payload.message);
      if (response.ok) {
        form.reset();
        router.refresh();
      }
    } catch {
      setTone("error");
      setMessage("The file could not be uploaded. Check the CSV format and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadTemplate() {
    setMessage(null);
    try {
      const response = await fetch("/api/download?kind=template");
      if (!response.ok) throw new Error("template failed");
      const content = await response.text();
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "student_performance_template.csv";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 1500);
      setTone("success");
      setMessage("Template downloaded as student_performance_template.csv.");
    } catch {
      setTone("error");
      setMessage("Could not download the template. Please try again.");
    }
  }

  async function restoreDefault() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/restore", { method: "POST" });
      const payload = (await response.json()) as { ok: boolean; message: string };
      setTone(response.ok ? "success" : "error");
      setMessage(payload.message);
      if (response.ok) router.refresh();
    } catch {
      setTone("error");
      setMessage("The default dataset could not be restored.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="upload-panel">
      <div>
        <p className="eyebrow">Data source</p>
        <h2>Default dataset or upload CSV</h2>
        <p className="muted">
          Use the built-in 520-student dataset, or upload a CSV. The uploader recognizes common alternate column names
          and adapts them automatically; anything it cannot read is reported clearly instead of crashing the dashboard.
        </p>
        <p className="muted small">
          Required columns: student_id, student_name, department, semester, section, attendance_percentage,
          study_hours_per_week, assignment_score, quiz_score, midterm_score, final_score, previous_cgpa.
        </p>
      </div>
      <form onSubmit={onUpload} className="upload-form">
        <input type="file" name="csv" accept=".csv,text/csv" />
        <button type="submit" className="primary-btn" disabled={busy}>
          <Upload size={15} />
          {busy ? "Working..." : "Upload CSV"}
        </button>
        <button type="button" className="ghost-btn" onClick={downloadTemplate} disabled={busy}>
          <FileDown size={15} />
          Download CSV template
        </button>
        <button type="button" className="ghost-btn" onClick={restoreDefault} disabled={busy}>
          <RefreshCw size={15} />
          Restore default dataset
        </button>
      </form>
      {message ? <p className={`banner ${tone}`}>{message}</p> : null}
    </section>
  );
}
