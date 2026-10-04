import { runSelfChecks } from "@/lib/self-check";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = runSelfChecks();
  return Response.json({
    ok: result.failed === 0,
    passed: result.passed,
    failed: result.failed,
    results: result.results,
  });
}
