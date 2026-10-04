import { seedDefaultDataset } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await seedDefaultDataset(true);
    return Response.json({
      ok: true,
      message: `Default dataset restored with ${result.count} students (seed 42).`,
    });
  } catch {
    return Response.json({ ok: false, message: "Could not restore the default dataset." }, { status: 500 });
  }
}
