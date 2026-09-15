import { NextResponse } from "next/server";
import { getCurrentActor } from "@/auth";
import { getAstrologyEngine } from "@/lib/astrology/engine";
import { getDemoArtifact } from "@/lib/demo";
import { loadReportArtifact } from "@/lib/jobs/processor";
import { rateLimit, requestIdentifier } from "@/lib/security/rate-limit";
import { transitRequestSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const limit = await rateLimit("report", requestIdentifier(request, actor.id));
  if (!limit.success) {
    return NextResponse.json(
      { error: "Calculation limit reached. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = transitRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Enter a valid range of up to two years.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }
  const artifact =
    parsed.data.reportId === "demo"
      ? await getDemoArtifact()
      : await loadReportArtifact(parsed.data.reportId, actor);
  if (!artifact) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  try {
    const transits = await getAstrologyEngine().calculateTransits(
      artifact.chart,
      parsed.data.startDate,
      parsed.data.endDate,
    );
    return NextResponse.json({ transits });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Transit calculation failed.",
      },
      { status: 422 },
    );
  }
}
