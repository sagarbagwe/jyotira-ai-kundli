import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentActor } from "@/auth";
import { getAIProvider } from "@/lib/ai/provider";
import { getAstrologyEngine } from "@/lib/astrology/engine";
import { rateLimit, requestIdentifier } from "@/lib/security/rate-limit";
import { generationRequestSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const limit = await rateLimit("report", requestIdentifier(request, actor.id));
  if (!limit.success) {
    return NextResponse.json(
      { error: "Report limit reached. Please try again after reset." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = generationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please correct the highlighted birth and report details.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const chart = await getAstrologyEngine().calculateNatal(parsed.data.birth);
    chart.transits = await getAstrologyEngine().calculateTransits(
      chart,
      parsed.data.report.startDate,
      parsed.data.report.endDate,
    );
    const interpretation = await getAIProvider().interpretReport(
      chart,
      parsed.data.report,
    );

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
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Kundli report generation failed.",
      },
      { status: 503 },
    );
  }
}
