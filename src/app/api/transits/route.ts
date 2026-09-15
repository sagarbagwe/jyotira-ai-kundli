import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor } from "@/auth";
import { getAstrologyEngine } from "@/lib/astrology/engine";
import { getDemoArtifact } from "@/lib/demo";
import { loadReportArtifact } from "@/lib/jobs/processor";
import { rateLimit, requestIdentifier } from "@/lib/security/rate-limit";

const schema = z
  .object({
    reportId: z.string().min(1).max(100),
    startDate: z.string().date(),
    endDate: z.string().date(),
  })
  .refine(
    ({ startDate, endDate }) =>
      new Date(endDate).getTime() > new Date(startDate).getTime(),
    { path: ["endDate"], message: "End date must be after start date." },
  );

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
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid range of up to two years." },
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