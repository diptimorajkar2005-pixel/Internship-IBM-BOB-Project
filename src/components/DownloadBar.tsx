"use client";

import { Download, Copy, X, Check, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const FILE_NAMES: Record<string, string> = {
  filtered: "filtered_students.csv",
  attention: "academic_attention.csv",
  summary: "summary_statistics.csv",
  department: "department_analysis.csv",
  semester: "semester_analysis.csv",
};

type Preview = { name: string; content: string } | null;

export function DownloadBar({ query }: { query: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview>(null);
  const [copied, setCopied] = useState(false);

  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);

  function urlFor(kind: string) {
    const next = new URLSearchParams(params);
    next.set("kind", kind);
    return `/api/download?${next.toString()}`;
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  function triggerBlobDownload(filename: string, content: string): boolean {
    try {
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.rel = "noopener";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 1500);
      return true;
    } catch {
      return false;
    }
  }

  async function handleDownload(kind: string) {
    setBusy(kind);
    setError(null);
    const filename = FILE_NAMES[kind] ?? "export.csv";
    try {
      const response = await fetch(urlFor(kind));
      if (!response.ok) throw new Error("download failed");
      const content = await response.text();
      const rowCount = Math.max(0, content.trim().split("\n").length - 1);

      const ok = triggerBlobDownload(filename, content);
      if (ok) {
        showToast(`${filename} downloaded successfully (${rowCount} row${rowCount === 1 ? "" : "s"}).`);
      } else {
        setPreview({ name: filename, content });
        setCopied(false);
      }
    } catch {
      setError("Could not generate that file. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function showCopy(kind: string) {
    setBusy(kind);
    setError(null);
    const filename = FILE_NAMES[kind] ?? "export.csv";
    try {
      const response = await fetch(urlFor(kind));
      if (!response.ok) throw new Error("preview failed");
      const content = await response.text();
      setPreview({ name: filename, content });
      setCopied(false);
    } catch {
      setError("Could not load that file. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function copyPreview() {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview.content);
      setCopied(true);
      showToast(`${preview.name} copied to clipboard.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard is blocked. Select the text in the box and press Ctrl+C.");
    }
  }

  const items = [
    { kind: "filtered", label: "Filtered dataset" },
    { kind: "attention", label: "Academic attention list" },
    { kind: "summary", label: "Summary statistics" },
    { kind: "department", label: "Department analysis" },
    { kind: "semester", label: "Semester analysis" },
  ];

  return (
    <section className="download-bar">
      <div>
        <p className="eyebrow">Exports</p>
        <h2>Download current filtered results</h2>
        <p className="muted small">
          Each button downloads its own CSV and shows a confirmation message. If the preview sandbox blocks the download,
          a copy window opens with the exact file contents.
        </p>
        {error ? <p className="banner error">{error}</p> : null}
      </div>
      <div className="download-actions">
        {items.map((item) => (
          <div key={item.kind} className="download-item">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => handleDownload(item.kind)}
              disabled={busy !== null}
            >
              <Download size={15} />
              {busy === item.kind ? "Working..." : item.label}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => showCopy(item.kind)}
              disabled={busy !== null}
            >
              copy
            </button>
          </div>
        ))}
      </div>

      {toast ? (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button type="button" className="toast-close" onClick={() => setToast(null)} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      ) : null}

      {preview ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-head">
              <h3>{preview.name}</h3>
              <button type="button" className="icon-btn" onClick={() => setPreview(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p className="muted small">
              Copy this CSV and paste it into a text editor, then save it as <strong>{preview.name}</strong>.
            </p>
            <textarea readOnly value={preview.content} className="csv-area" onFocus={(e) => e.target.select()} />
            <div className="download-actions">
              <button type="button" className="primary-btn" onClick={copyPreview}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied!" : "Copy CSV"}
              </button>
              <button type="button" className="ghost-btn" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
