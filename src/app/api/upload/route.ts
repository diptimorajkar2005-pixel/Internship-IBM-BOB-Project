import { adaptDataset } from "@/lib/adapter";
import { cleanStudentRows } from "@/lib/data-cleaning";
import { parseCsv } from "@/lib/csv";
import { replaceWithUploaded } from "@/lib/repository";
import { REQUIRED_COLUMNS } from "@/lib/types";
import { validateDataset } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ ok: false, message: "Please attach a CSV file named in the upload form." }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return Response.json({ ok: false, message: "Only CSV files are accepted." }, { status: 400 });
    }

    const text = await file.text();
    if (!text.trim()) {
      return Response.json({ ok: false, message: "The uploaded CSV is empty." }, { status: 400 });
    }

    const parsed = parseCsv(text);
    if (parsed.rows.length === 0) {
      return Response.json({ ok: false, message: "The uploaded CSV has no data rows." }, { status: 400 });
    }

    // Try to adapt alternate schemas (e.g. Kaggle "Student Performance") into
    // the standard columns before validating.
    const adapted = adaptDataset(parsed.headers, parsed.rows);
    const headers = adapted.headers;
    const rows = adapted.rows;

    const validation = validateDataset(headers, rows);
    if (!validation.ok) {
      const base = validation.issues.map((issue) => issue.message).join(" ");
      const hint = ` The required columns are: ${REQUIRED_COLUMNS.join(", ")}. Use "Download CSV template" to get the exact format, or restore the default dataset.`;
      return Response.json({ ok: false, message: base + hint }, { status: 400 });
    }

    const cleaned = cleanStudentRows(rows, validation.extraColumns);
    if (cleaned.records.length === 0) {
      return Response.json({ ok: false, message: "No valid student rows remained after cleaning." }, { status: 400 });
    }

    if (adapted.notes.length > 0) {
      cleaned.report.notes = [...adapted.notes, ...cleaned.report.notes];
    }

    await replaceWithUploaded(cleaned.records, cleaned.report);

    const adaptNote = adapted.adapted ? ` ${adapted.notes.join(" ")}` : "";
    const validationNote = validation.issues.length
      ? ` Notes: ${validation.issues.map((issue) => issue.message).join(" ")}`
      : "";
    return Response.json({
      ok: true,
      message: `Uploaded ${cleaned.records.length} student row(s) after cleaning (${cleaned.report.rowsBefore} rows before cleaning).${adaptNote}${validationNote}`,
    });
  } catch {
    return Response.json(
      { ok: false, message: "The CSV could not be processed. Check the column names and try again." },
      { status: 400 },
    );
  }
}
