import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { rateLimit, requestIdentifier } from "@/lib/security/rate-limit";
import { generationRequestSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const limit = await rateLimit("report", requestIdentifier(request));
  if (!limit.success) {
    return NextResponse.json({ error: "Report limit reached. Please try again after reset." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = generationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please correct the highlighted birth and report details.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  let stage = "loading the Swiss Ephemeris calculation engine";
  try {
    const { getAstrologyEngine } = await import("@/lib/astrology/engine");
    stage = "calculating the natal chart";
    const engine = getAstrologyEngine();
    const chart = await engine.calculateNatal(parsed.data.birth);
    stage = "calculating transits";
    chart.transits = await engine.calculateTransits(
      chart,
      parsed.data.report.startDate,
      parsed.data.report.endDate,
    );
    stage = "loading Gemini";
    const { getAIProvider } = await import("@/lib/ai/provider");
    stage = "generating the Gemini interpretation";
    const interpretation = await getAIProvider().interpretReport(chart, parsed.data.report);
    return NextResponse.json(
      {
        artifact: {
          id: `local-${randomUUID()}`,
          userId: "local-browser-session",
          chart,
          request: parsed.data.report,
          interpretation,
          createdAt: new Date().toISOString(),
        },
      },
      { headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } },
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown runtime error.";
    console.error("Stateless Kundli generation failed", { stage, error });
    return NextResponse.json(
      { error: `Kundli generation failed while ${stage}: ${detail}` },
      { status: 503 },
    );
  }
}
